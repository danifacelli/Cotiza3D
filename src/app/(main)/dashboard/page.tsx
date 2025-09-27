

"use client"

import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Quote, Material, Machine, Settings, Investment, Client } from "@/lib/types"
import { DEFAULT_QUOTES, DEFAULT_MATERIALS, DEFAULT_MACHINES, DEFAULT_SETTINGS, DEFAULT_INVESTMENTS, DEFAULT_CLIENTS } from "@/lib/defaults"
import { calculateCosts } from "@/lib/calculations"
import { formatCurrency, cn } from "@/lib/utils"
import { getExchangeRate } from "@/services/exchange-rate-service"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"

import {
  FileText,
  Layers,
  Settings as SettingsIcon,
  Printer,
  DollarSign,
  TrendingUp,
  FileClock,
  CheckCircle,
  Circle,
  Banknote,
  TrendingDown,
  ClipboardList,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ActiveQuotes } from "@/components/dashboard/active-quotes"

export default function Dashboard() {
  const [quotes, setQuotes, isQuotesHydrated] = useLocalStorage<Quote[]>(LOCAL_STORAGE_KEYS.QUOTES, DEFAULT_QUOTES);
  const [materials, __, isMaterialsHydrated] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS);
  const [machines, ___, isMachinesHydrated] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES);
  const [settings, ____, isSettingsHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const [investments, _____, isInvestmentsHydrated] = useLocalStorage<Investment[]>(LOCAL_STORAGE_KEYS.INVESTMENTS, DEFAULT_INVESTMENTS);
  const [clients, ______, isClientsHydrated] = useLocalStorage<Client[]>(LOCAL_STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true);
  const { toast } = useToast()

  useEffect(() => {
    async function fetchRate() {
      if (!settings?.localCurrency) return;
      setIsExchangeRateLoading(true);
      try {
        const rate = await getExchangeRate(settings.localCurrency);
        setExchangeRate(rate);
      } catch (error) {
        console.error(error);
        setExchangeRate(null);
      } finally {
        setIsExchangeRateLoading(false);
      }
    }
    if (isSettingsHydrated) {
        fetchRate();
    }
  }, [settings?.localCurrency, isSettingsHydrated]);

  const isHydrated = isQuotesHydrated && isMaterialsHydrated && isMachinesHydrated && isSettingsHydrated && isInvestmentsHydrated && isClientsHydrated && !isExchangeRateLoading;

  const dashboardData = ((): {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    confirmedQuotesCount: number;
    inPreparationQuotes: number;
    draftQuotes: number;
    materialCount: number;
    machineCount: number;
    hasQuotes: boolean;
    totalInvestments: number;
    investmentRecoveryPercentage: number;
    activeQuotes: Quote[];
  } | null => {
    if (!isHydrated) return null;

    const acceptedStatuses: Quote['status'][] = ['accepted', 'in_preparation', 'ready_to_deliver', 'delivered'];
    const confirmedQuotes = quotes.filter(q => acceptedStatuses.includes(q.status));
    
    const activeStatuses: Quote['status'][] = ['accepted', 'in_preparation', 'ready_to_deliver'];
    const activeQuotes = quotes.filter(q => activeStatuses.includes(q.status));
    
    const totals = confirmedQuotes.reduce((acc, quote) => {
        const { breakdown } = calculateCosts(quote, materials, machines, settings);
        if (breakdown) {
            const quantity = quote.quantity || 1;
            acc.revenue += breakdown.total * quantity;
            acc.cost += breakdown.costSubtotal * quantity;
        }
        return acc;
    }, { revenue: 0, cost: 0 });

    const totalProfit = totals.revenue - totals.cost;
    const totalInvestments = investments.reduce((acc, inv) => acc + inv.amount, 0);
    const investmentRecoveryPercentage = totalInvestments > 0 ? Math.min((totalProfit / totalInvestments) * 100, 100) : 0;

    return {
      totalRevenue: totals.revenue,
      totalCost: totals.cost,
      totalProfit: totalProfit,
      confirmedQuotesCount: confirmedQuotes.length,
      inPreparationQuotes: quotes.filter(q => q.status === 'in_preparation').length,
      draftQuotes: quotes.filter(q => q.status === 'draft').length,
      materialCount: materials.length,
      machineCount: machines.length,
      hasQuotes: quotes.length > 0,
      totalInvestments: totalInvestments,
      investmentRecoveryPercentage: investmentRecoveryPercentage,
      activeQuotes,
    };
  })();

  const setupSteps = [
    {
      label: "Configura tus ajustes",
      href: "/settings",
      isComplete: true, // Settings always exist
      icon: SettingsIcon
    },
    {
      label: "Añade tus máquinas",
      href: "/machines",
      isComplete: (dashboardData?.machineCount ?? 0) > 0,
      icon: Printer,
    },
    {
      label: "Registra tus insumos",
      href: "/materials",
      isComplete: (dashboardData?.materialCount ?? 0) > 0,
      icon: Layers
    },
     {
      label: "Registra tus inversiones",
      href: "/investments",
      isComplete: (investments?.length ?? 0) > 0,
      icon: Banknote,
    },
    {
      label: "Crea tu primer presupuesto",
      href: "/quotes/new",
      isComplete: dashboardData?.hasQuotes ?? false,
      icon: FileText
    }
  ]
  
  const formatLocal = (amount: number) => {
    if (!exchangeRate || !settings?.localCurrency) return null;
    const decimalPlaces = settings.localCurrency === 'CLP' || settings.localCurrency === 'PYG' ? 0 : settings.currencyDecimalPlaces;
    return formatCurrency(amount * exchangeRate, settings.localCurrency, decimalPlaces, 'symbol');
  };

  const renderMetricCard = (title: string, value: string, localValue: string | null, description: string, icon: React.ReactNode, isLoading: boolean) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </>
        ) : (
            <>
                <div className="text-2xl font-bold">{value}</div>
                {localValue && <div className="text-sm text-muted-foreground">{localValue}</div>}
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </>
        )}
      </CardContent>
    </Card>
  );

  const handleUpdateStatus = (id: string, status: Quote['status']) => {
    setQuotes(
      quotes.map((q) => (q.id === id ? { ...q, status } : q))
    );
    const statusMap: Record<Quote['status'], string> = {
        draft: 'Borrador',
        accepted: 'Aceptado',
        in_preparation: 'En Preparación',
        ready_to_deliver: 'Listo para Entregar',
        delivered: 'Entregado',
        canceled: 'Cancelado'
    }
    toast({
      title: "Estado actualizado",
      description: `El presupuesto ha sido marcado como ${statusMap[status]}.`,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderMetricCard(
            "Ingresos Totales",
            formatCurrency(dashboardData?.totalRevenue ?? 0, 'USD', settings.currencyDecimalPlaces),
            formatLocal(dashboardData?.totalRevenue ?? 0),
            `Basado en ${dashboardData?.confirmedQuotesCount ?? 0} presupuestos confirmados`,
            <DollarSign className="h-4 w-4 text-muted-foreground" />,
            !isHydrated
        )}
        {renderMetricCard(
            "Ganancia Neta",
            formatCurrency(dashboardData?.totalProfit ?? 0, 'USD', settings.currencyDecimalPlaces),
            formatLocal(dashboardData?.totalProfit ?? 0),
            `Costo total: ${formatCurrency(dashboardData?.totalCost ?? 0, 'USD', settings.currencyDecimalPlaces)}`,
            <TrendingUp className="h-4 w-4 text-muted-foreground" />,
            !isHydrated
        )}
        {renderMetricCard(
            "En Preparación",
            dashboardData?.inPreparationQuotes.toString() ?? "0",
            null,
            "Presupuestos que se están trabajando actualmente",
            <ClipboardList className="h-4 w-4 text-muted-foreground" />,
            !isHydrated
        )}
         {renderMetricCard(
            "Presupuestos Pendientes",
            dashboardData?.draftQuotes.toString() ?? "0",
            null,
            "Presupuestos en estado de borrador",
            <FileClock className="h-4 w-4 text-muted-foreground" />,
            !isHydrated
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
            <ActiveQuotes 
                quotes={dashboardData?.activeQuotes ?? []}
                clients={clients}
                onUpdateStatus={handleUpdateStatus}
                isHydrated={isHydrated}
            />
        </div>
        <div className="space-y-4 xl:col-span-1">
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    <span>Recuperación de Inversión</span>
                </CardTitle>
                <CardDescription>
                    Progreso de tus ganancias para cubrir el costo de tus inversiones.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isHydrated ? (
                    <>
                        <Progress value={dashboardData?.investmentRecoveryPercentage ?? 0} className="w-full" />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <div className="text-xs text-muted-foreground">Ganancia Neta</div>
                                <div className="font-bold text-green-500">
                                    {formatCurrency(dashboardData?.totalProfit ?? 0, 'USD', settings.currencyDecimalPlaces)}
                                </div>
                                <div className="text-xs font-mono text-muted-foreground">
                                    {formatLocal(dashboardData?.totalProfit ?? 0)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">Inversión Total</div>
                                <div className="font-bold text-red-500">
                                    {formatCurrency(dashboardData?.totalInvestments ?? 0, 'USD', settings.currencyDecimalPlaces)}
                                </div>
                                <div className="text-xs font-mono text-muted-foreground">
                                    {formatLocal(dashboardData?.totalInvestments ?? 0)}
                                </div>
                            </div>
                        </div>
                        {(dashboardData?.totalInvestments ?? 0) > 0 && 
                            <div className="text-center mt-4">
                            <p className="text-2xl font-bold">{dashboardData?.investmentRecoveryPercentage.toFixed(2)}%</p>
                            <p className="text-xs text-muted-foreground">recuperado</p>
                            </div>
                        }
                    </>
                ) : (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
                )}
            </CardContent>
            </Card>
             <Card>
            <CardHeader>
                <CardTitle>¡Bienvenido a Cotiza3D!</CardTitle>
                <CardDescription>Sigue estos pasos para empezar a calcular los costos de tus impresiones 3D.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {setupSteps.map((step, index) => (
                    <Link href={step.href} key={index} className="block group">
                    <div className="flex items-center gap-4 p-3 rounded-md hover:bg-muted transition-colors">
                        {isHydrated ? (
                        step.isComplete ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                        )
                        ) : (
                        <Skeleton className="h-6 w-6 rounded-full" />
                        )}
                        <div>
                        <p className={cn("font-semibold group-hover:text-primary", step.isComplete && "line-through text-muted-foreground")}>
                            {step.label}
                        </p>
                        </div>
                        <step.icon className="h-5 w-5 text-muted-foreground ml-auto" />
                    </div>
                    </Link>
                ))}
                </div>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

    

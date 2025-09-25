
"use client"

import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Quote, Material, Machine, Settings, Investment } from "@/lib/types"
import { DEFAULT_QUOTES, DEFAULT_MATERIALS, DEFAULT_MACHINES, DEFAULT_SETTINGS, DEFAULT_INVESTMENTS } from "@/lib/defaults"
import { calculateCosts } from "@/lib/calculations"
import { formatCurrency, cn } from "@/lib/utils"

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

export default function Dashboard() {
  const [quotes, _, isQuotesHydrated] = useLocalStorage<Quote[]>(LOCAL_STORAGE_KEYS.QUOTES, DEFAULT_QUOTES);
  const [materials, __, isMaterialsHydrated] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS);
  const [machines, ___, isMachinesHydrated] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES);
  const [settings, ____, isSettingsHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const [investments, _____, isInvestmentsHydrated] = useLocalStorage<Investment[]>(LOCAL_STORAGE_KEYS.INVESTMENTS, DEFAULT_INVESTMENTS);

  const isHydrated = isQuotesHydrated && isMaterialsHydrated && isMachinesHydrated && isSettingsHydrated && isInvestmentsHydrated;

  const dashboardData = ((): {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    acceptedQuotes: number;
    draftQuotes: number;
    materialCount: number;
    machineCount: number;
    hasQuotes: boolean;
    totalInvestments: number;
    investmentRecoveryPercentage: number;
  } | null => {
    if (!isHydrated) return null;

    const accepted = quotes.filter(q => q.status === 'accepted');
    
    const totals = accepted.reduce((acc, quote) => {
        const { breakdown } = calculateCosts(quote, materials, machines, settings);
        if (breakdown) {
            acc.revenue += breakdown.total;
            acc.cost += breakdown.costSubtotal;
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
      acceptedQuotes: accepted.length,
      draftQuotes: quotes.filter(q => q.status === 'draft').length,
      materialCount: materials.length,
      machineCount: machines.length,
      hasQuotes: quotes.length > 0,
      totalInvestments: totalInvestments,
      investmentRecoveryPercentage: investmentRecoveryPercentage,
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

  const renderMetricCard = (title: string, value: string, description: string, icon: React.ReactNode, isLoading: boolean) => (
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
                <p className="text-xs text-muted-foreground">{description}</p>
            </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderMetricCard(
            "Ingresos Totales",
            formatCurrency(dashboardData?.totalRevenue ?? 0, 'USD', settings.currencyDecimalPlaces),
            `Basado en ${dashboardData?.acceptedQuotes ?? 0} presupuestos aceptados`,
            <DollarSign className="h-4 w-4 text-muted-foreground" />,
            !isHydrated
        )}
        {renderMetricCard(
            "Ganancia Neta",
            formatCurrency(dashboardData?.totalProfit ?? 0, 'USD', settings.currencyDecimalPlaces),
            `Costo total: ${formatCurrency(dashboardData?.totalCost ?? 0, 'USD', settings.currencyDecimalPlaces)}`,
            <TrendingUp className="h-4 w-4 text-muted-foreground" />,
            !isHydrated
        )}
        {renderMetricCard(
            "Presupuestos Aceptados",
            dashboardData?.acceptedQuotes.toString() ?? "0",
            "Presupuestos que han sido aprobados",
            <CheckCircle className="h-4 w-4 text-muted-foreground" />,
            !isHydrated
        )}
         {renderMetricCard(
            "Presupuestos Pendientes",
            dashboardData?.draftQuotes.toString() ?? "0",
            "Presupuestos en estado de borrador",
            <FileClock className="h-4 w-4 text-muted-foreground" />,
            !isHydrated
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <Card className="lg:col-span-1">
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
        <div className="space-y-4">
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
                          <div className="flex justify-between text-sm mt-2">
                              <span className="font-bold text-green-500">
                                  {formatCurrency(dashboardData?.totalProfit ?? 0, 'USD', settings.currencyDecimalPlaces)}
                              </span>
                              <span className="font-bold text-red-500">
                                  {formatCurrency(dashboardData?.totalInvestments ?? 0, 'USD', settings.currencyDecimalPlaces)}
                              </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Ganancia Neta</span>
                              <span>Inversión Total</span>
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
        </div>
      </div>
    </div>
  )
}

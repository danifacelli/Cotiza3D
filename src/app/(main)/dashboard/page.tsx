
"use client"

import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Quote, Material, Machine, Settings } from "@/lib/types"
import { DEFAULT_QUOTES, DEFAULT_MATERIALS, DEFAULT_MACHINES, DEFAULT_SETTINGS } from "@/lib/defaults"
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

export default function Dashboard() {
  const [quotes, _, isQuotesHydrated] = useLocalStorage<Quote[]>(LOCAL_STORAGE_KEYS.QUOTES, DEFAULT_QUOTES);
  const [materials, __, isMaterialsHydrated] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS);
  const [machines, ___, isMachinesHydrated] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES);
  const [settings, ____, isSettingsHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  const isHydrated = isQuotesHydrated && isMaterialsHydrated && isMachinesHydrated && isSettingsHydrated;

  const dashboardData = ((): {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    acceptedQuotes: number;
    draftQuotes: number;
    materialCount: number;
    machineCount: number;
    hasQuotes: boolean;
  } | null => {
    if (!isHydrated) return null;

    const accepted = quotes.filter(q => q.status === 'accepted');
    
    const totals = accepted.reduce((acc, quote) => {
        const { breakdown } = calculateCosts(quote, materials, machines, settings);
        if (breakdown) {
            acc.revenue += breakdown.total;
            acc.cost += breakdown.subtotal;
        }
        return acc;
    }, { revenue: 0, cost: 0 });

    return {
      totalRevenue: totals.revenue,
      totalCost: totals.cost,
      totalProfit: totals.revenue - totals.cost,
      acceptedQuotes: accepted.length,
      draftQuotes: quotes.filter(q => q.status === 'draft').length,
      materialCount: materials.length,
      machineCount: machines.length,
      hasQuotes: quotes.length > 0,
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
            <Card className="hover:bg-accent/10 transition-colors">
                <Link href="/materials" className="flex items-center p-6">
                    <div className="flex-1">
                        <CardTitle className="text-base font-semibold">
                            <span>Insumos</span>
                        </CardTitle>
                         {isHydrated ? (
                             <p className="text-3xl font-bold mt-2">{dashboardData?.materialCount}</p>
                         ) : <Skeleton className="h-8 w-12 mt-2" />}
                        <p className="text-xs text-muted-foreground mt-1">Filamentos registrados</p>
                    </div>
                    <Layers className="h-8 w-8 text-muted-foreground" />
                </Link>
            </Card>
             <Card className="hover:bg-accent/10 transition-colors">
                 <Link href="/machines" className="flex items-center p-6">
                    <div className="flex-1">
                        <CardTitle className="text-base font-semibold">
                            <span>Máquinas</span>
                        </CardTitle>
                         {isHydrated ? (
                            <p className="text-3xl font-bold mt-2">{dashboardData?.machineCount}</p>
                         ) : <Skeleton className="h-8 w-12 mt-2" />}
                        <p className="text-xs text-muted-foreground mt-1">Impresoras registradas</p>
                    </div>
                    <Printer className="h-8 w-8 text-muted-foreground" />
                </Link>
            </Card>
        </div>
      </div>
    </div>
  )
}



"use client"

import { useState, useMemo, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { DEFAULT_INVESTMENTS, generateId, DEFAULT_QUOTES, DEFAULT_MATERIALS, DEFAULT_MACHINES, DEFAULT_SETTINGS } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import type { Investment, Quote, Material, Machine, Settings } from "@/lib/types"
import { InvestmentForm } from "@/components/investments/investment-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { InvestmentsTable } from "@/components/investments/investments-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { calculateCosts } from "@/lib/calculations"
import { Progress } from "@/components/ui/progress"
import { getExchangeRate } from "@/services/exchange-rate-service"

type InvestmentFormData = {
    name: string;
    amount: number;
    createdAt: Date;
}

export default function InvestmentsPage() {
  const [investments, setInvestments, isInvestmentsHydrated] = useLocalStorage<Investment[]>(
    LOCAL_STORAGE_KEYS.INVESTMENTS,
    DEFAULT_INVESTMENTS
  )
  const [quotes, _, isQuotesHydrated] = useLocalStorage<Quote[]>(LOCAL_STORAGE_KEYS.QUOTES, DEFAULT_QUOTES);
  const [materials, __, isMaterialsHydrated] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS);
  const [machines, ___, isMachinesHydrated] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES);
  const [settings, ____, isSettingsHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
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

  const isHydrated = isInvestmentsHydrated && isQuotesHydrated && isMaterialsHydrated && isMachinesHydrated && isSettingsHydrated && !isExchangeRateLoading;

  const investmentData = useMemo(() => {
    if (!isHydrated) return { totalInvested: 0, totalProfit: 0, amountToRecover: 0, recoveryPercentage: 0 };
    
    const acceptedStatuses: Quote['status'][] = ['accepted', 'in_preparation', 'ready_to_deliver', 'delivered'];
    const confirmedQuotes = quotes.filter(q => acceptedStatuses.includes(q.status));
    
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
    const totalInvested = investments.reduce((acc, inv) => acc + inv.amount, 0);
    const amountToRecover = Math.max(0, totalInvested - totalProfit);
    const recoveryPercentage = totalInvested > 0 ? Math.min((totalProfit / totalInvested) * 100, 100) : 0;
    
    return { totalInvested, totalProfit, amountToRecover, recoveryPercentage };
  }, [isHydrated, quotes, materials, machines, settings, investments])


  const handleNewInvestment = () => {
    setSelectedInvestment(null)
    setIsFormOpen(true)
  }

  const handleEditInvestment = (investment: Investment) => {
    setSelectedInvestment(investment)
    setIsFormOpen(true)
  }

  const handleDeleteInvestment = (id: string) => {
    setInvestments(investments.filter((i) => i.id !== id))
    toast({
      title: "Inversión eliminada",
      description: "La inversión ha sido eliminada correctamente.",
    })
  }

  const handleSaveInvestment = (data: InvestmentFormData) => {
    const investmentData = {
        ...data,
        createdAt: data.createdAt.toISOString(),
    }
    if (selectedInvestment) {
      setInvestments(
        investments.map((i) =>
          i.id === selectedInvestment.id ? { ...i, ...investmentData } : i
        )
      )
      toast({
        title: "Inversión actualizada",
        description: "Los cambios han sido guardados.",
      })
    } else {
      const newInvestment: Investment = {
        id: generateId(),
        ...investmentData,
      }
      setInvestments([newInvestment, ...investments])
       toast({
        title: "Inversión creada",
        description: "La nueva inversión ha sido agregada.",
      })
    }
    setIsFormOpen(false)
    setSelectedInvestment(null)
  }

  const formatLocal = (amount: number) => {
    if (!exchangeRate || !settings?.localCurrency) return null;
    const decimalPlaces = settings.localCurrency === 'CLP' || settings.localCurrency === 'PYG' ? 0 : settings.currencyDecimalPlaces;
    return formatCurrency(amount * exchangeRate, settings.localCurrency, decimalPlaces, 'symbol');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Inversiones</h1>
            <p className="text-muted-foreground">Administra tus gastos de capital y compras de equipo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleNewInvestment}>
                <PlusCircle className="mr-2" />
                Nueva Inversión
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>{selectedInvestment ? "Editar Inversión" : "Nueva Inversión"}</DialogTitle>
                <DialogDescription>
                    {selectedInvestment ? "Modifica los detalles de tu inversión." : "Añade una nueva inversión a tu lista."}
                </DialogDescription>
                </DialogHeader>
                <InvestmentForm
                onSubmit={handleSaveInvestment}
                defaultValues={selectedInvestment}
                onCancel={() => setIsFormOpen(false)}
                />
            </DialogContent>
            </Dialog>
        </div>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Recuperación de Inversión</CardTitle>
            <CardDescription>Progreso de tus ganancias para cubrir tus gastos de capital.</CardDescription>
        </CardHeader>
        <CardContent>
            {isHydrated ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                                <TrendingDown className="h-4 w-4 text-red-500"/>
                                <span>Total Invertido</span>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(investmentData.totalInvested, "USD", settings.currencyDecimalPlaces)}</p>
                            <p className="text-sm text-muted-foreground">{formatLocal(investmentData.totalInvested)}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                               <TrendingUp className="h-4 w-4 text-green-500"/>
                               <span>Ganancia Neta</span>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(investmentData.totalProfit, "USD", settings.currencyDecimalPlaces)}</p>
                            <p className="text-sm text-muted-foreground">{formatLocal(investmentData.totalProfit)}</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                             <div className="text-sm text-muted-foreground">
                                {investmentData.recoveryPercentage >= 100 ? "¡Inversión Recuperada!" : "Falta por recuperar"}
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(investmentData.amountToRecover, "USD", settings.currencyDecimalPlaces)}</p>
                            <p className="text-sm text-muted-foreground">{formatLocal(investmentData.amountToRecover)}</p>
                        </div>
                    </div>
                    {investmentData.totalInvested > 0 && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Progreso de Recuperación</span>
                                <span className="text-sm font-bold">{investmentData.recoveryPercentage.toFixed(2)}%</span>
                            </div>
                            <Progress value={investmentData.recoveryPercentage} />
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-4">
                    <div className="h-24 w-full bg-muted animate-pulse rounded-md" />
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md" />
                </div>
            )}
        </CardContent>
       </Card>

      <InvestmentsTable
        investments={investments}
        onEdit={handleEditInvestment}
        onDelete={handleDeleteInvestment}
        settings={settings}
        exchangeRate={exchangeRate}
        isHydrated={isHydrated}
      />
    </div>
  )
}

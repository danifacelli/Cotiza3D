
"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Quote, Material, Machine, Settings } from "@/lib/types"
import { DEFAULT_QUOTES, generateId, DEFAULT_MATERIALS, DEFAULT_MACHINES, DEFAULT_SETTINGS } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, CheckCircle, XCircle, FileText, Loader2 } from "lucide-react"
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
import { QuotesTable, type QuoteWithTotals } from "@/components/quotes/quotes-table"
import { calculateCosts } from "@/lib/calculations"
import { getExchangeRate } from "@/services/exchange-rate-service"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type StatusFilter = "all" | Quote["status"];

export default function QuotesPage() {
  const [quotes, setQuotes, isQuotesHydrated] = useLocalStorage<Quote[]>(
    LOCAL_STORAGE_KEYS.QUOTES,
    DEFAULT_QUOTES
  )
  const [materials, _, isMaterialsHydrated] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS)
  const [machines, __, isMachinesHydrated] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES)
  const [settings, ___, isSettingsHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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
    fetchRate();
  }, [settings?.localCurrency]);

  const isHydrated = isQuotesHydrated && isMaterialsHydrated && isMachinesHydrated && isSettingsHydrated;

  const quotesWithTotals = useMemo((): QuoteWithTotals[] => {
    if (!isHydrated) return [];
    
    return quotes.map(quote => {
      const { breakdown } = calculateCosts(quote, materials, machines, settings);
      const totalUSD = breakdown?.total ?? 0;
      const totalLocal = exchangeRate ? totalUSD * exchangeRate : 0;
      return { ...quote, totalUSD, totalLocal };
    });
  }, [quotes, materials, machines, settings, exchangeRate, isHydrated]);
  
  const filteredQuotes = useMemo(() => {
    if (statusFilter === 'all') {
      return quotesWithTotals;
    }
    return quotesWithTotals.filter(quote => quote.status === statusFilter);
  }, [quotesWithTotals, statusFilter]);

  const handleDeleteQuote = (id: string) => {
    setQuotes(quotes.filter((q) => q.id !== id))
    toast({
      title: "Presupuesto eliminado",
      description: "El presupuesto ha sido eliminado correctamente.",
    })
  }

  const handleDuplicateQuote = (id: string) => {
    const quoteToDuplicate = quotes.find((q) => q.id === id)
    if (quoteToDuplicate) {
      const newQuote: Quote = {
        ...quoteToDuplicate,
        id: generateId(),
        name: `${quoteToDuplicate.name} (Copia)`,
        status: "draft",
        createdAt: new Date().toISOString(),
      }
      setQuotes([newQuote, ...quotes])
      toast({
        title: "Presupuesto duplicado",
        description: "Se ha creado una copia del presupuesto.",
      })
    }
  }

  const handleDeleteAllQuotes = () => {
    setQuotes([])
    toast({
      title: "Todos los presupuestos han sido eliminados",
      description: "Tu lista de presupuestos está ahora vacía.",
    })
  }
  
  const handleUpdateStatus = (id: string, status: Quote['status']) => {
    setQuotes(
      quotes.map((q) => (q.id === id ? { ...q, status } : q))
    );
    toast({
      title: "Estado actualizado",
      description: `El presupuesto ha sido marcado como ${status === 'accepted' ? 'aceptado' : status === 'canceled' ? 'cancelado' : 'borrador'}.`,
    });
  };

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: quotes.length,
      draft: 0,
      accepted: 0,
      canceled: 0,
    };
    quotes.forEach(quote => {
      counts[quote.status]++;
    });
    return counts;
  }, [quotes]);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Presupuestos</h1>
          <p className="text-muted-foreground">
            Administra tus presupuestos de impresión 3D.
          </p>
        </div>
        <div className="flex gap-2">
          {isHydrated && quotes.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive-outline">
                  <Trash2 className="mr-2" />
                  Eliminar Todo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    ¿Estás absolutamente seguro?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará
                    permanemente todos tus presupuestos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllQuotes} asChild>
                    <Button variant="destructive">Sí, eliminar todo</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button asChild>
            <Link href="/quotes/new">
              <PlusCircle className="mr-2" />
              Nuevo Presupuesto
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todos ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="draft">Borrador ({statusCounts.draft})</TabsTrigger>
            <TabsTrigger value="accepted">Aceptados ({statusCounts.accepted})</TabsTrigger>
            <TabsTrigger value="canceled">Cancelados ({statusCounts.canceled})</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {(isExchangeRateLoading || !isHydrated) ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                <Loader2 className="animate-spin mr-3" />
                <p>Cargando presupuestos...</p>
            </div>
        ) : (
             <QuotesTable
                quotes={filteredQuotes}
                onDelete={handleDeleteQuote}
                onDuplicate={handleDuplicateQuote}
                onUpdateStatus={handleUpdateStatus}
                settings={settings}
                isHydrated={isHydrated}
              />
        )}
      </div>

    </div>
  )
}

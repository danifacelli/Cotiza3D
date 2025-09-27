

"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Quote, Material, Machine, Settings, Client } from "@/lib/types"
import { DEFAULT_QUOTES, generateId, DEFAULT_MATERIALS, DEFAULT_MACHINES, DEFAULT_SETTINGS, DEFAULT_CLIENTS } from "@/lib/defaults"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"


type StatusFilter = "all" | Quote["status"];

const ITEMS_PER_PAGE = 10;

export default function QuotesPage() {
  const [quotes, setQuotes, isQuotesHydrated] = useLocalStorage<Quote[]>(
    LOCAL_STORAGE_KEYS.QUOTES,
    DEFAULT_QUOTES
  )
  const [materials, _, isMaterialsHydrated] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS)
  const [machines, __, isMachinesHydrated] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES)
  const [settings, ___, isSettingsHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  const [clients, ____, isClientsHydrated] = useLocalStorage<Client[]>(LOCAL_STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);

  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

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

  const isHydrated = isQuotesHydrated && isMaterialsHydrated && isMachinesHydrated && isSettingsHydrated && isClientsHydrated;

  const quotesWithTotals = useMemo((): QuoteWithTotals[] => {
    if (!isHydrated) return [];
    
    return quotes.map(quote => {
      const { breakdown } = calculateCosts(quote, materials, machines, settings);
      const quantity = quote.quantity || 1;
      const totalUSD = (breakdown?.total ?? 0) * quantity;
      
      let totalLocal: number;
      if (breakdown?.isManualPrice && typeof quote.finalPriceOverrideLocal === 'number') {
        totalLocal = quote.finalPriceOverrideLocal * quantity;
      } else {
        totalLocal = exchangeRate ? totalUSD * exchangeRate : 0;
      }

      const costUSD = breakdown?.costSubtotal ?? 0;
      const isManualPrice = breakdown?.isManualPrice ?? false;
      const client = clients.find(c => c.id === quote.clientId);
      return { ...quote, clientName: client?.name, totalUSD, totalLocal, costUSD, isManualPrice };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [quotes, materials, machines, settings, exchangeRate, isHydrated, clients]);
  
  const filteredQuotes = useMemo(() => {
    if (statusFilter === 'all') {
      return quotesWithTotals;
    }
    return quotesWithTotals.filter(quote => quote.status === statusFilter);
  }, [quotesWithTotals, statusFilter]);
  
  const paginatedQuotes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuotes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredQuotes, currentPage]);

  const totalPages = Math.ceil(filteredQuotes.length / ITEMS_PER_PAGE);
  
  const generalTotals = useMemo(() => {
    return filteredQuotes.reduce((acc, quote) => {
        acc.totalUSD += quote.totalUSD;
        acc.totalLocal += quote.totalLocal;
        return acc;
    }, { totalUSD: 0, totalLocal: 0 });
  }, [filteredQuotes]);


  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);


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

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> & { all: number } = {
      all: quotes.length,
      draft: 0,
      accepted: 0,
      in_preparation: 0,
      ready_to_deliver: 0,
      delivered: 0,
      canceled: 0,
    };
    quotes.forEach(quote => {
      if (counts[quote.status] !== undefined) {
          counts[quote.status]++;
      }
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
          <Button asChild>
            <Link href="/quotes/new">
              <PlusCircle className="mr-2" />
              Nuevo Presupuesto
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <ScrollArea className="w-full whitespace-nowrap">
            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <TabsList>
                <TabsTrigger value="all">Todos ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="draft">Borrador ({statusCounts.draft})</TabsTrigger>
                <TabsTrigger value="accepted">Aceptados ({statusCounts.accepted})</TabsTrigger>
                <TabsTrigger value="in_preparation">En Preparación ({statusCounts.in_preparation})</TabsTrigger>
                <TabsTrigger value="ready_to_deliver">Listos p/ Entregar ({statusCounts.ready_to_deliver})</TabsTrigger>
                <TabsTrigger value="delivered">Entregados ({statusCounts.delivered})</TabsTrigger>
                <TabsTrigger value="canceled">Cancelados ({statusCounts.canceled})</TabsTrigger>
            </TabsList>
            </Tabs>
             <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        {(isExchangeRateLoading || !isHydrated) ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                <Loader2 className="animate-spin mr-3" />
                <p>Cargando presupuestos...</p>
            </div>
        ) : (
            <>
             <QuotesTable
                quotes={paginatedQuotes}
                onDelete={handleDeleteQuote}
                onUpdateStatus={handleUpdateStatus}
                onDuplicate={handleDuplicateQuote}
                settings={settings}
                isHydrated={isHydrated}
              />
              <div className="flex items-center justify-between pt-2">
                <div className="text-sm text-muted-foreground space-x-4">
                    <span>
                        <span className="font-semibold">{filteredQuotes.length}</span> {`presupuesto(s)`}
                    </span>
                    <span>
                       Total: <span className="font-semibold">{formatCurrency(generalTotals.totalUSD, "USD", settings.currencyDecimalPlaces)}</span>
                       {` / `}
                       <span className="font-semibold">{formatCurrency(generalTotals.totalLocal, settings.localCurrency, settings.localCurrency === 'CLP' || settings.localCurrency === 'PYG' ? 0 : settings.currencyDecimalPlaces, 'symbol')}</span>
                    </span>
                </div>
                <div className="flex items-center gap-2 self-end">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        size="sm"
                    >
                        Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        size="sm"
                    >
                        Siguiente
                    </Button>
                </div>
              </div>
            </>
        )}
      </div>

    </div>
  )
}

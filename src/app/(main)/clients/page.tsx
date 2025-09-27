

"use client"

import { useState, useMemo, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { DEFAULT_CLIENTS, generateId, DEFAULT_QUOTES, DEFAULT_MATERIALS, DEFAULT_MACHINES, DEFAULT_SETTINGS } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, Loader2 } from "lucide-react"
import type { Client, Quote, Material, Machine, Settings } from "@/lib/types"
import { ClientForm, type ClientFormValues } from "@/components/clients/client-form"
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
import { ClientsTable, type ClientWithStats } from "@/components/clients/clients-table"
import { calculateCosts } from "@/lib/calculations"
import { ClientHistoryDialog } from "@/components/clients/client-history-dialog"
import { getExchangeRate } from "@/services/exchange-rate-service"

export default function ClientsPage() {
  const [clients, setClients, isClientsHydrated] = useLocalStorage<Client[]>(
    LOCAL_STORAGE_KEYS.CLIENTS,
    DEFAULT_CLIENTS
  )
  const [quotes, setQuotes, isQuotesHydrated] = useLocalStorage<Quote[]>(LOCAL_STORAGE_KEYS.QUOTES, DEFAULT_QUOTES)
  const [materials, _, isMaterialsHydrated] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS)
  const [machines, __, isMachinesHydrated] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES)
  const [settings, ___, isSettingsHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [historyClient, setHistoryClient] = useState<Client | null>(null)
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


  const isHydrated = isClientsHydrated && isQuotesHydrated && isMaterialsHydrated && isMachinesHydrated && isSettingsHydrated && !isExchangeRateLoading;

  const clientsWithStats: ClientWithStats[] = useMemo(() => {
    if (!isHydrated) return [];
    
    return clients.map(client => {
      const clientQuotes = quotes.filter(q => q.clientId === client.id);
      
      const lastJob = clientQuotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      
      const confirmedStatuses: Quote['status'][] = ['accepted', 'in_preparation', 'ready_to_deliver', 'delivered'];
      const totalPurchased = clientQuotes
        .filter(q => confirmedStatuses.includes(q.status))
        .reduce((sum, quote) => {
          const { breakdown } = calculateCosts(quote, materials, machines, settings);
          const quantity = quote.quantity || 1;
          return sum + (breakdown?.total ?? 0) * quantity;
        }, 0);

      return {
        ...client,
        lastJobName: lastJob?.name,
        totalPurchased: totalPurchased,
      };
    });
  }, [clients, quotes, materials, machines, settings, isHydrated]);


  const handleNewClient = () => {
    setSelectedClient(null)
    setIsFormOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsFormOpen(true)
  }
  
  const handleViewHistory = (client: Client) => {
    setHistoryClient(client);
  }

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id))
    // Also, optionally unlink from quotes
    setQuotes(quotes.map(q => q.clientId === id ? {...q, clientId: undefined} : q))

    toast({
      title: "Cliente eliminado",
      description: "El cliente ha sido eliminado correctamente.",
    })
  }

  const handleSaveClient = (data: ClientFormValues) => {
    if (selectedClient) {
      setClients(
        clients.map((c) =>
          c.id === selectedClient.id ? { ...c, ...data } : c
        )
      )
      toast({
        title: "Cliente actualizado",
        description: "Los cambios han sido guardados.",
      })
    } else {
      const newClient: Client = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
      }
      setClients([newClient, ...clients])
       toast({
        title: "Cliente creado",
        description: "El nuevo cliente ha sido agregado.",
      })
    }
    setIsFormOpen(false)
    setSelectedClient(null)
  }
  
  const clientHistoryQuotes = useMemo(() => {
    if (!historyClient) return [];
    return quotes
      .filter(q => q.clientId === historyClient.id)
      .map(quote => {
        const { breakdown } = calculateCosts(quote, materials, machines, settings);
        const quantity = quote.quantity || 1;
        return {
          ...quote,
          totalUSD: (breakdown?.total ?? 0) * quantity,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [historyClient, quotes, materials, machines, settings]);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">Administra tu lista de clientes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleNewClient}>
                <PlusCircle className="mr-2" />
                Nuevo Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                <DialogTitle>{selectedClient ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
                <DialogDescription>
                    {selectedClient ? "Modifica los detalles de tu cliente." : "Añade un nuevo cliente a tu lista."}
                </DialogDescription>
                </DialogHeader>
                <ClientForm
                    onSubmit={handleSaveClient}
                    defaultValues={selectedClient}
                    onCancel={() => setIsFormOpen(false)}
                />
            </DialogContent>
            </Dialog>
        </div>
      </div>
        {!isHydrated ? (
             <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                <Loader2 className="animate-spin mr-3" />
                <p>Cargando clientes...</p>
            </div>
        ) : (
             <ClientsTable
                clients={clientsWithStats}
                onEdit={handleEditClient}
                onDelete={handleDeleteClient}
                onViewHistory={handleViewHistory}
                isHydrated={isHydrated}
                settings={settings}
                exchangeRate={exchangeRate}
              />
        )}

        <ClientHistoryDialog 
            client={historyClient}
            quotes={clientHistoryQuotes}
            settings={settings}
            exchangeRate={exchangeRate}
            isOpen={!!historyClient}
            onOpenChange={(isOpen) => !isOpen && setHistoryClient(null)}
        />
    </div>
  )
}

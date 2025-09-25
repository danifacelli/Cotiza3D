
"use client"

import { useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { DEFAULT_FUTURE_PURCHASES, DEFAULT_SETTINGS, generateId, DEFAULT_INVESTMENTS } from "@/lib/defaults"
import type { FuturePurchase, Settings, Investment } from "@/lib/types"
import { getExchangeRate } from "@/services/exchange-rate-service"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { FuturePurchaseForm, type FuturePurchaseFormValues } from "@/components/future-purchases/future-purchase-form"
import { FuturePurchasesTable } from "@/components/future-purchases/future-purchases-table"

export default function FuturePurchasesPage() {
  const [purchases, setPurchases, isPurchasesHydrated] = useLocalStorage<FuturePurchase[]>(LOCAL_STORAGE_KEYS.FUTURE_PURCHASES, DEFAULT_FUTURE_PURCHASES)
  const [investments, setInvestments] = useLocalStorage<Investment[]>(LOCAL_STORAGE_KEYS.INVESTMENTS, DEFAULT_INVESTMENTS)
  const [settings, _, isSettingsHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<FuturePurchase | null>(null)
  const [purchaseToConvert, setPurchaseToConvert] = useState<FuturePurchase | null>(null)

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

  const isHydrated = isPurchasesHydrated && isSettingsHydrated;

  const handleNewPurchase = () => {
    setSelectedPurchase(null)
    setIsFormOpen(true)
  }

  const handleEditPurchase = (purchase: FuturePurchase) => {
    setSelectedPurchase(purchase)
    setIsFormOpen(true)
  }

  const handleDeletePurchase = (id: string) => {
    setPurchases(purchases.filter((p) => p.id !== id))
    toast({
      title: "Artículo eliminado",
      description: "El artículo ha sido eliminado de tu lista de compras.",
    })
  }

  const handleDuplicatePurchase = (id: string) => {
    const purchaseToDuplicate = purchases.find((p) => p.id === id);
    if (purchaseToDuplicate) {
      const newPurchase: FuturePurchase = {
        ...purchaseToDuplicate,
        id: generateId(),
        name: `${purchaseToDuplicate.name} (Copia)`,
        createdAt: new Date().toISOString(),
      };
      setPurchases([newPurchase, ...purchases]);
      toast({
        title: "Artículo duplicado",
        description: "Se ha creado una copia del artículo en tu lista.",
      });
    }
  };
  
  const handleSavePurchase = (data: FuturePurchaseFormValues) => {
    if (selectedPurchase) {
      // Editing
      setPurchases(
        purchases.map((p) =>
          p.id === selectedPurchase.id ? { ...p, ...data, name: data.name, description: data.description } : p
        )
      )
      toast({
        title: "Artículo actualizado",
        description: "Los cambios han sido guardados.",
      })
    } else {
      // Creating
      const newPurchase: FuturePurchase = {
        id: generateId(),
        ...data,
        name: data.name,
        description: data.description || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      setPurchases([...purchases, newPurchase])
       toast({
        title: "Artículo añadido",
        description: "El nuevo artículo ha sido agregado a tu lista.",
      })
    }
    setIsFormOpen(false)
    setSelectedPurchase(null)
  }

  const handleMarkAsPurchased = (purchase: FuturePurchase) => {
    setPurchaseToConvert(purchase)
  }

  const confirmConvertToInvestment = () => {
    if (!purchaseToConvert) return;

    // 1. Add to investments
    const newInvestment: Investment = {
        id: generateId(),
        name: purchaseToConvert.name,
        amount: purchaseToConvert.priceUSD,
        createdAt: new Date().toISOString(),
    };
    setInvestments([newInvestment, ...investments]);

    // 2. Remove from future purchases
    setPurchases(purchases.filter(p => p.id !== purchaseToConvert.id));

    toast({
        title: "¡Compra realizada!",
        description: `${purchaseToConvert.name} ha sido movido a tus inversiones.`,
    });

    setPurchaseToConvert(null);
  }


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Futuras Compras</h1>
          <p className="text-muted-foreground">
            Planifica y organiza los próximos artículos para tu taller.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleNewPurchase}>
                <PlusCircle className="mr-2" />
                Añadir Artículo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                <DialogTitle>{selectedPurchase ? "Editar Artículo" : "Nuevo Artículo"}</DialogTitle>
                <DialogDescription>
                    {selectedPurchase ? "Modifica los detalles del artículo." : "Añade un nuevo artículo a tu lista de deseos."}
                </DialogDescription>
                </DialogHeader>
                <FuturePurchaseForm
                    onSubmit={handleSavePurchase}
                    defaultValues={selectedPurchase}
                    onCancel={() => setIsFormOpen(false)}
                />
            </DialogContent>
        </Dialog>
      </div>

       <FuturePurchasesTable
        purchases={purchases}
        onEdit={handleEditPurchase}
        onDelete={handleDeletePurchase}
        onDuplicate={handleDuplicatePurchase}
        onMarkAsPurchased={handleMarkAsPurchased}
        settings={settings}
        exchangeRate={exchangeRate}
        isHydrated={isHydrated && !isExchangeRateLoading}
      />
      
       <AlertDialog open={!!purchaseToConvert} onOpenChange={() => setPurchaseToConvert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Convertir en Inversión?</AlertDialogTitle>
            <AlertDialogDescription>
              Has marcado <strong>{purchaseToConvert?.name}</strong> como comprado. ¿Deseas moverlo a tu lista de inversiones?
              Se creará una nueva inversión con el nombre y el precio del artículo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, solo marcar como comprado</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConvertToInvestment}>Sí, convertir en inversión</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

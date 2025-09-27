
"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Design, Material, Machine, Settings, Quote } from "@/lib/types"
import { DEFAULT_DESIGNS, generateId, DEFAULT_MATERIALS, DEFAULT_MACHINES, DEFAULT_SETTINGS, DEFAULT_QUOTES } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DesignsTable, type DesignWithTotals } from "@/components/designs/designs-table"
import { calculateCosts } from "@/lib/calculations"
import { getExchangeRate } from "@/services/exchange-rate-service"

export default function DesignsPage() {
  const router = useRouter()
  const [designs, setDesigns, isDesignsHydrated] = useLocalStorage<Design[]>(
    LOCAL_STORAGE_KEYS.DESIGNS,
    DEFAULT_DESIGNS
  )
  const [quotes, setQuotes, isQuotesHydrated] = useLocalStorage<Quote[]>(
    LOCAL_STORAGE_KEYS.QUOTES,
    DEFAULT_QUOTES
  )
  const [materials, _, isMaterialsHydrated] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS)
  const [machines, __, isMachinesHydrated] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES)
  const [settings, ___, isSettingsHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)

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

  const isHydrated = isDesignsHydrated && isMaterialsHydrated && isMachinesHydrated && isSettingsHydrated;

  const designsWithTotals = useMemo((): DesignWithTotals[] => {
    if (!isHydrated) return [];
    
    return designs.map(design => {
      const { breakdown } = calculateCosts(design, materials, machines, settings);
      const totalUSD = breakdown?.total ?? 0;
      
      let totalLocal: number;
      if (breakdown?.isManualPrice && typeof design.finalPriceOverrideLocal === 'number') {
        totalLocal = design.finalPriceOverrideLocal;
      } else {
        totalLocal = exchangeRate ? totalUSD * exchangeRate : 0;
      }

      const costUSD = breakdown?.costSubtotal ?? 0;
      const costLocal = exchangeRate ? costUSD * exchangeRate : 0;
      const isManualPrice = breakdown?.isManualPrice ?? false;
      return { ...design, totalUSD, totalLocal, costUSD, costLocal, isManualPrice };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [designs, materials, machines, settings, exchangeRate, isHydrated]);
  
  const handleDeleteDesign = (id: string) => {
    setDesigns(designs.filter((d) => d.id !== id))
    toast({
      title: "Diseño eliminado",
      description: "El diseño ha sido eliminado correctamente.",
    })
  }

  const handleDuplicateDesign = (id: string) => {
    const designToDuplicate = designs.find((d) => d.id === id)
    if (designToDuplicate) {
      const newDesign: Design = {
        ...designToDuplicate,
        id: generateId(),
        name: `${designToDuplicate.name} (Copia)`,
        createdAt: new Date().toISOString(),
      }
      setDesigns([newDesign, ...designs])
      toast({
        title: "Diseño duplicado",
        description: "Se ha creado una copia del diseño.",
      })
    }
  }
  
  const handleConvertToQuote = (id: string) => {
    const designToConvert = designs.find((d) => d.id === id);
    if (!designToConvert) {
      toast({ title: "Error", description: "No se encontró el diseño.", variant: "destructive" });
      return;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { photo1_base64, photo2_base64, ...designData } = designToConvert;

    const newQuote: Quote = {
      ...designData,
      id: generateId(),
      designId: designToConvert.id,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    setQuotes([newQuote, ...quotes]);
    
    toast({
      title: "Presupuesto Generado",
      description: `Se ha creado un nuevo presupuesto a partir del diseño "${designToConvert.name}".`,
    });

    router.push(`/quotes/${newQuote.id}/edit`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diseños</h1>
          <p className="text-muted-foreground">
            Calcula los costos de tus diseños y modelos 3D.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/designs/new">
              <PlusCircle className="mr-2" />
              Nuevo Diseño
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {(isExchangeRateLoading || !isHydrated) ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-md">
                <Loader2 className="animate-spin mr-3" />
                <p>Cargando diseños...</p>
            </div>
        ) : (
             <DesignsTable
                designs={designsWithTotals}
                onDelete={handleDeleteDesign}
                onDuplicate={handleDuplicateDesign}
                onConvertToQuote={handleConvertToQuote}
                settings={settings}
                isHydrated={isHydrated}
              />
        )}
      </div>
    </div>
  )
}

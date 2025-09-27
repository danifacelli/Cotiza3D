

"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Quote, Machine, Material, Settings, ExtraCost, Client } from "@/lib/types"
import { DEFAULT_MACHINES, DEFAULT_MATERIALS, DEFAULT_SETTINGS, DEFAULT_CLIENTS, generateId } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, FileDown, Info, Instagram, Loader2, CalendarIcon, ChevronsUpDown, UserPlus, PackageCheck, FileText, CheckCircle, XCircle, ClipboardList, Calculator, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { calculateCosts, CostBreakdown } from "@/lib/calculations"
import { CostSummary } from "@/components/quotes/cost-summary"
import { useState, useEffect, useMemo, useRef } from "react"
import { formatCurrency, cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getExchangeRate } from "@/services/exchange-rate-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { QuotePartForm, PartFormValues } from "./quote-part-form"
import { QuotePartsTable } from "./quote-parts-table"
import { QuoteExtraCostForm, ExtraCostFormValues } from "./quote-extra-cost-form"
import { QuoteExtraCostsTable } from "./quote-extra-costs-table"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { QuotePDF } from "./quote-pdf"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ClientForm, type ClientFormValues } from "../clients/client-form"

const PartSchema = z.object({
  id: z.string(),
  materialId: z.string().min(1, "Debes seleccionar un material."),
  materialGrams: z.coerce.number().min(0.01, "Los gramos deben ser mayor a 0."),
})

const QuoteSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  clientId: z.string().optional(),
  designId: z.string().optional(),
  status: z.enum(["draft", "accepted", "in_preparation", "ready_to_deliver", "delivered", "canceled"]),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1.").default(1),
  parts: z.array(PartSchema).min(1, "Debes añadir al menos un material."),
  machineId: z.string().min(1, "Debes seleccionar una máquina."),
  designCost: z.coerce.number().optional(),
  deliveryDate: z.date().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  depth: z.coerce.number().optional(),
  tariffType: z.enum(["peak", "off-peak", "mixed"]),
  peakHours: z.coerce.number().optional(),
  printHours: z.coerce.number().optional(),
  printMinutes: z.coerce.number().optional(),
  printSeconds: z.coerce.number().optional(),
  laborHours: z.coerce.number().optional(),
  laborMinutes: z.coerce.number().optional(),
  extraCosts: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1, "La descripción es requerida."),
      amount: z.coerce.number().min(0, "El monto no puede ser negativo."),
    })
  ).optional(),
  notes: z.string().optional(),
  finalPriceOverride: z.coerce.number().optional(),
  finalPriceOverrideLocal: z.coerce.number().optional(),
}).refine(data => (data.printHours || 0) + (data.printMinutes || 0) + (data.printSeconds || 0) > 0, {
  message: "El tiempo de impresión total debe ser mayor a 0.",
  path: ["printHours"], 
});


type QuoteFormValues = z.infer<typeof QuoteSchema>

interface QuoteFormProps {
  quote?: Quote
}

export function QuoteForm({ quote }: QuoteFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [quotes, setQuotes] = useLocalStorage<Quote[]>(LOCAL_STORAGE_KEYS.QUOTES, [])
  const [machines, setMachines, isMachinesHydrated] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES)
  const [materials, __, isMaterialsHydrated] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS)
  const [settings, setSettings, isSettingsHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  const [clients, setClients, isClientsHydrated] = useLocalStorage<Client[]>(LOCAL_STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS);

  const [calculationResult, setCalculationResult] = useState<{ breakdown: CostBreakdown | null }>({ breakdown: null });
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true);
  const [isPartFormOpen, setIsPartFormOpen] = useState(false);
  const [isExtraCostFormOpen, setIsExtraCostFormOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);


  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(QuoteSchema),
    defaultValues: quote ? {
        ...quote,
        quantity: quote.quantity || 1,
        printHours: quote.printHours ? Math.floor(quote.printHours) : 0,
        printMinutes: quote.printHours ? Math.floor((quote.printHours * 60) % 60) : 0,
        printSeconds: quote.printHours ? Math.round((quote.printHours * 3600) % 60) : 0,
        laborHours: quote.laborHours ? Math.floor(quote.laborHours) : 0,
        laborMinutes: quote.laborHours ? Math.floor((quote.laborHours * 60) % 60) : 0,
        deliveryDate: quote.deliveryDate ? new Date(quote.deliveryDate) : undefined,
    } : {
        name: "",
        clientId: "",
        status: "draft",
        quantity: 1,
        parts: [],
        machineId: machines.length > 0 ? machines[0].id : "",
        designCost: 0,
        deliveryDate: undefined,
        width: 0,
        height: 0,
        depth: 0,
        tariffType: "off-peak",
        peakHours: 0,
        extraCosts: [],
        notes: "",
        printHours: 0,
        printMinutes: 0,
        printSeconds: 0,
        laborHours: 0,
        laborMinutes: 0,
        finalPriceOverride: undefined,
        finalPriceOverrideLocal: undefined,
    },
  })
  
  const { control, setValue, watch } = form;

  const { fields: partFields, append: appendPart, remove: removePart } = useFieldArray({
    control: form.control,
    name: "parts",
  })

  const { fields: extraCostFields, append: appendExtraCost, remove: removeExtraCost } = useFieldArray({
    control: form.control,
    name: "extraCosts",
  })
  
  const watchedParts = watch("parts");
  const watchedMachineId = watch("machineId");
  const watchedDesignCost = watch("designCost");
  const watchedTariffType = watch("tariffType");
  const watchedPeakHours = watch("peakHours");
  const watchedExtraCosts = watch("extraCosts");
  const watchedFinalPriceOverride = watch("finalPriceOverride");
  const watchedPrintHours = watch("printHours");
  const watchedPrintMinutes = watch("printMinutes");
  const watchedPrintSeconds = watch("printSeconds");
  const watchedLaborHours = watch("laborHours");
  const watchedLaborMinutes = watch("laborMinutes");
  const watchedClientId = watch("clientId");

  const printHoursDecimal = useMemo(() => (Number(watchedPrintHours) || 0) + ((Number(watchedPrintMinutes) || 0) / 60) + ((Number(watchedPrintSeconds) || 0) / 3600), [watchedPrintHours, watchedPrintMinutes, watchedPrintSeconds]);
  const laborHoursDecimal = useMemo(() => (Number(watchedLaborHours) || 0) + ((Number(watchedLaborMinutes) || 0) / 60), [watchedLaborHours, watchedLaborMinutes]);

  useEffect(() => {
    const isReady =
      isMachinesHydrated &&
      isMaterialsHydrated &&
      isSettingsHydrated;

    if (!isReady) {
      setCalculationResult({ breakdown: null });
      return;
    }
    
    const quoteDataForCalc = {
      machineId: watchedMachineId,
      parts: watchedParts,
      designCost: watchedDesignCost,
      tariffType: watchedTariffType,
      peakHours: watchedPeakHours,
      extraCosts: watchedExtraCosts,
      finalPriceOverride: watchedFinalPriceOverride,
      printHours: printHoursDecimal,
      laborHours: laborHoursDecimal,
    }

    const result = calculateCosts(
      quoteDataForCalc,
      materials,
      machines,
      settings
    );
    setCalculationResult({ breakdown: result.breakdown });

    if (result.breakdown && !result.breakdown.isManualPrice && watchedFinalPriceOverride !== undefined) {
        setValue('finalPriceOverride', undefined);
        setValue('finalPriceOverrideLocal', undefined);
    }

  }, [
    printHoursDecimal,
    laborHoursDecimal,
    watchedParts,
    watchedMachineId,
    watchedDesignCost,
    watchedTariffType,
    watchedPeakHours,
    watchedExtraCosts,
    watchedFinalPriceOverride,
    settings,
    materials,
    machines,
    isMachinesHydrated,
    isMaterialsHydrated,
    isSettingsHydrated,
    setValue
  ]);

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


  const materialSummary = useMemo(() => {
    const totalGrams = watchedParts?.reduce((acc, part) => {
        const parsedGrams = parseFloat(part.materialGrams as any);
        return acc + (isNaN(parsedGrams) ? 0 : parsedGrams);
    }, 0) || 0;
    
    return { totalGrams };
  }, [watchedParts]);
  
  const selectedMachine = useMemo(() => {
    return machines.find(m => m.id === watchedMachineId);
  }, [machines, watchedMachineId]);

  const selectedClient = useMemo(() => {
    return clients.find(c => c.id === watchedClientId);
  }, [clients, watchedClientId]);


  const onSubmit = (data: QuoteFormValues) => {
    const finalPrintHours = (data.printHours || 0) + ((data.printMinutes || 0) / 60) + ((data.printSeconds || 0) / 3600);
    const finalLaborHours = (data.laborHours || 0) + ((data.laborMinutes || 0) / 60);

    const quoteToSave: Quote = {
      id: quote?.id || generateId(),
      status: data.status,
      createdAt: quote?.createdAt || new Date().toISOString(),
      name: data.name,
      clientId: data.clientId,
      designId: data.designId,
      quantity: data.quantity,
      parts: data.parts,
      machineId: data.machineId,
      designCost: data.designCost || 0,
      deliveryDate: data.deliveryDate ? data.deliveryDate.toISOString() : undefined,
      width: data.width || 0,
      height: data.height || 0,
      depth: data.depth || 0,
      printHours: finalPrintHours,
      tariffType: data.tariffType,
      peakHours: data.peakHours,
      laborHours: finalLaborHours,
      extraCosts: data.extraCosts || [],
      notes: data.notes || "",
      finalPriceOverride: data.finalPriceOverride,
      finalPriceOverrideLocal: data.finalPriceOverrideLocal,
    }

    if (quote) {
      setQuotes(quotes.map((q) => (q.id === quote.id ? quoteToSave : q)))
      toast({ title: "Presupuesto actualizado" })
    } else {
      setQuotes([quoteToSave, ...quotes])
      toast({ title: "Presupuesto creado" })
    }
    router.push("/quotes")
  }

  const handleSaveClient = (data: ClientFormValues) => {
      const newClient: Client = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      setClients(prev => [newClient, ...prev]);
      setValue('clientId', newClient.id);
      toast({
        title: "Cliente creado",
        description: `${newClient.name} ha sido añadido y seleccionado.`,
      });
      setIsClientFormOpen(false);
  }

  const handleGeneratePdf = async () => {
    const quoteName = watch("name") || 'presupuesto';
    if (!pdfRef.current || !calculationResult.breakdown) {
      toast({
        title: "Error",
        description: "No hay datos suficientes para generar el PDF.",
        variant: "destructive"
      })
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2, 
        useCORS: true,
        backgroundColor: null, 
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const widthInPdf = pdfWidth - 40; // With padding
      const heightInPdf = widthInPdf / ratio;
      
      let finalHeight = heightInPdf;
      if (heightInPdf > pdfHeight - 40) {
        finalHeight = pdfHeight - 40;
      }

      pdf.addImage(imgData, 'PNG', 20, 20, widthInPdf, finalHeight);
      pdf.save(`presupuesto_${quoteName.replace(/ /g, '_')}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error al generar PDF",
        description: "Hubo un problema al crear el archivo PDF.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  }
  
  const energyTariffDescription = useMemo(() => {
    if (!settings || !selectedMachine) return null;

    const { 
      peakTariffStartTime, 
      peakTariffEndTime, 
      peakEnergyCostKwh, 
      offPeakEnergyCostKwh 
    } = settings;

    const tariffType = watchedTariffType;

    switch (tariffType) {
      case 'peak':
        return `Punta (${peakTariffStartTime} - ${peakTariffEndTime}): ${formatCurrency(peakEnergyCostKwh, "USD", settings.currencyDecimalPlaces, 'code')}/kWh.`;
      case 'off-peak':
        return `Fuera de Punta: ${formatCurrency(offPeakEnergyCostKwh, "USD", settings.currencyDecimalPlaces, 'code')}/kWh.`;
      case 'mixed':
         return `Punta (${peakTariffStartTime} - ${peakTariffEndTime}): ${formatCurrency(peakEnergyCostKwh, "USD", settings.currencyDecimalPlaces, 'code')}/kWh. Resto: ${formatCurrency(offPeakEnergyCostKwh, "USD", settings.currencyDecimalPlaces, 'code')}/kWh.`;
      default:
        return null;
    }
  }, [watchedTariffType, settings, selectedMachine]);
  
  const handleAddPart = (data: PartFormValues) => {
    appendPart({
      id: generateId(),
      materialId: data.materialId,
      materialGrams: data.materialGrams,
    });
    setIsPartFormOpen(false);
  };
  
  const handleAddExtraCost = (data: ExtraCostFormValues) => {
    appendExtraCost({
      id: generateId(),
      description: data.description,
      amount: data.amount,
    });
    setIsExtraCostFormOpen(false);
  };

  const partsWithNames = useMemo(() => {
    return partFields.map(part => {
      const material = materials.find(m => m.id === part.materialId);
      return {
        ...part,
        name: material ? `${material.name} (${material.type})` : 'Material no encontrado',
      };
    });
  }, [partFields, materials]);

  const watchedValues = watch();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 grid gap-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{quote ? "Editar Presupuesto" : "Nuevo Presupuesto"}</CardTitle>
                        <CardDescription>
                            {quote ? 'Modifica los detalles para actualizar tu presupuesto.' : 'Completa los datos para generar un nuevo presupuesto.'}
                        </CardDescription>
                    </div>
                     <div className="text-right">
                        {settings.companyName && (
                            <p className="font-semibold">{settings.companyName}</p>
                        )}
                         {settings.companyInstagram && (
                            <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mt-1">
                                <Instagram className="w-4 h-4" />
                                <span>{settings.companyInstagram}</span>
                            </div>
                        )}
                    </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Trabajo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Engranaje para motor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Cliente</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value
                                        ? clients.find(
                                            (client) => client.id === field.value
                                        )?.name
                                        : "Seleccionar cliente"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                               <Command>
                                 <CommandInput placeholder="Buscar cliente..." />
                                 <CommandList>
                                     <CommandEmpty>No se encontró ningún cliente.</CommandEmpty>
                                     <CommandGroup>
                                        <CommandItem
                                            onSelect={() => setIsClientFormOpen(true)}
                                            className="cursor-pointer"
                                            >
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Crear nuevo cliente
                                        </CommandItem>
                                     {clients.map((client) => (
                                        <CommandItem
                                            value={client.name}
                                            key={client.id}
                                            onSelect={() => {
                                                form.setValue("clientId", client.id)
                                            }}
                                            >
                                            {client.name}
                                        </CommandItem>
                                        ))}
                                     </CommandGroup>
                                 </CommandList>
                               </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   {quote && (
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado del Presupuesto</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona un estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Borrador</SelectItem>
                              <SelectItem value="accepted">Aceptado</SelectItem>
                              <SelectItem value="in_preparation">En Preparación</SelectItem>
                              <SelectItem value="ready_to_deliver">Listo para entregar</SelectItem>
                              <SelectItem value="delivered">Entregado</SelectItem>
                              <SelectItem value="canceled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Dimensiones de la Pieza</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="width"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Ancho (mm)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Alto (mm)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="depth"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Largo (mm)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Print Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de Impresión y Mano de Obra</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                     <FormField
                        control={control}
                        name="machineId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Máquina</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una máquina" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {machines.map((m) => (
                                    <SelectItem key={m.id} value={m.id}>
                                    {m.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            {selectedMachine && (
                                <FormDescription>
                                Depreciación: {formatCurrency(selectedMachine.costPerHour, "USD", settings.currencyDecimalPlaces)} / hora.
                                </FormDescription>
                            )}
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                 </div>
                  <div className="space-y-2">
                     <FormField
                        control={control}
                        name="tariffType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Tarifa de Energía</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una tarifa" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="peak">Punta</SelectItem>
                                    <SelectItem value="off-peak">Fuera de punta</SelectItem>
                                    <SelectItem value="mixed">Mixto</SelectItem>
                                </SelectContent>
                            </Select>
                             {energyTariffDescription && (
                                <FormDescription>
                                  {energyTariffDescription}
                                </FormDescription>
                            )}
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                 </div>
                
                <div className="space-y-2">
                  <FormLabel>Tiempo de Impresión</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    <FormField
                      control={control}
                      name="printHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Horas</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="printMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Minutos</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="printSeconds"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel className="text-xs text-muted-foreground">Segundos</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormMessage>{form.formState.errors.printHours?.message}</FormMessage>
                </div>
                
                {watchedValues.tariffType === 'mixed' && (
                  <div className="space-y-2">
                    <FormField
                      control={control}
                      name="peakHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas en Tarifa Punta</FormLabel>
                          <FormControl>
                             <Input type="number" placeholder="0" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} />
                          </FormControl>
                          <FormDescription>
                            Del total, cuántas horas se imprimen en horario punta.
                          </FormDescription>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <FormLabel>Tiempo de Mano de Obra</FormLabel>
                   <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={control}
                      name="laborHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Horas</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="laborMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-muted-foreground">Minutos</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                   <FormDescription className="flex items-center gap-1.5 text-xs">
                        <Info className="w-3.5 h-3.5"/>
                        <span>Tiempo de preparación, limpieza, etc.</span>
                    </FormDescription>
                  <FormMessage>{form.formState.errors.laborHours?.message}</FormMessage>
                </div>
                 <div className="space-y-2">
                    <FormField
                      control={control}
                      name="designCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Costo del Diseño (USD)</FormLabel>
                          <FormControl>
                             <Input type="number" step="0.01" placeholder="0.00" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)} />
                          </FormControl>
                          <FormDescription>
                            Si compraste el modelo 3D, ingresa aquí su costo.
                          </FormDescription>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="deliveryDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha de Entrega</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Selecciona una fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Fecha estimada en que estará listo el trabajo.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Materiales Utilizados</CardTitle>
                             {form.formState.errors.parts && partFields.length === 0 && (
                                <p className="text-sm font-medium text-destructive mt-2">
                                    Debes añadir al menos un material.
                                </p>
                             )}
                        </div>
                        <Dialog open={isPartFormOpen} onOpenChange={setIsPartFormOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" size="sm">
                                    <PlusCircle className="mr-2" />
                                    Añadir Material
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Añadir Material</DialogTitle>
                                </DialogHeader>
                                <QuotePartForm materials={materials} onSubmit={handleAddPart} onCancel={() => setIsPartFormOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <QuotePartsTable parts={partsWithNames} onRemove={removePart} />
                    {materialSummary.totalGrams > 0 && (
                        <Alert variant="default" className="mt-4">
                            <AlertDescription className="flex justify-between items-center text-sm">
                                <span>Total Gramos: <strong>{materialSummary.totalGrams.toFixed(2)} g</strong></span>
                                {calculationResult.breakdown && (
                                    <span>Costo Material: <strong>{formatCurrency(calculationResult.breakdown.materialCost, "USD", settings.currencyDecimalPlaces)}</strong></span>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Costos Adicionales y Notas</CardTitle>
                  <Dialog open={isExtraCostFormOpen} onOpenChange={setIsExtraCostFormOpen}>
                      <DialogTrigger asChild>
                           <Button type="button" size="sm">
                              <PlusCircle className="mr-2" />
                              Añadir Costo
                          </Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>Añadir Costo Adicional</DialogTitle>
                          </DialogHeader>
                          <QuoteExtraCostForm onSubmit={handleAddExtraCost} onCancel={() => setIsExtraCostFormOpen(false)} />
                      </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                <QuoteExtraCostsTable costs={extraCostFields} onRemove={removeExtraCost} settings={settings} />
                <Separator />
                <FormField
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Añade notas internas o para el cliente..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 sticky top-20">
            <CostSummary
                breakdown={calculationResult.breakdown}
                settings={settings}
                machine={selectedMachine}
                quoteInput={{...watchedValues, printHours: printHoursDecimal, laborHours: laborHoursDecimal}}
                exchangeRate={exchangeRate}
                isExchangeRateLoading={isExchangeRateLoading}
                form={form}
                actions={
                  <>
                     <Button type="submit" className="w-full">
                       {quote ? "Guardar Cambios" : "Guardar Presupuesto"}
                     </Button>
                     <Button type="button" variant="secondary" className="w-full" onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
                       {isGeneratingPdf ? <Loader2 className="animate-spin mr-2" /> : <FileDown className="mr-2" />}
                       {isGeneratingPdf ? "Generando..." : "Generar PDF"}
                     </Button>
                     <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2" />
                       Cancelar
                     </Button>
                  </>
                }
            />
          </div>
        </div>
      </form>
      
      {/* Hidden element for PDF generation */}
      <div className="fixed -z-50 -left-[10000px] top-0">
          <div ref={pdfRef} className="w-[800px] bg-white text-black">
             {calculationResult.breakdown && (
                <QuotePDF
                    quote={{...watchedValues, id: quote?.id || '', createdAt: quote?.createdAt || new Date().toISOString(), deliveryDate: watchedValues.deliveryDate?.toISOString()} as Quote}
                    client={selectedClient}
                    parts={partsWithNames}
                    settings={settings}
                    machine={selectedMachine}
                    breakdown={calculationResult.breakdown}
                    exchangeRate={exchangeRate}
                    isExchangeRateLoading={isExchangeRateLoading}
                />
             )}
          </div>
      </div>

       <Dialog open={isClientFormOpen} onOpenChange={setIsClientFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Añade un nuevo cliente a tu lista.
              </DialogDescription>
            </DialogHeader>
            <ClientForm
              onSubmit={handleSaveClient}
              onCancel={() => setIsClientFormOpen(false)}
            />
          </DialogContent>
        </Dialog>

    </Form>
  )
}

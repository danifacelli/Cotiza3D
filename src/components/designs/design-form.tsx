
"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Design, Machine, Material, Settings, ExtraCost } from "@/lib/types"
import { DEFAULT_MACHINES, DEFAULT_MATERIALS, DEFAULT_SETTINGS, generateId } from "@/lib/defaults"
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
import { PlusCircle, FileDown, Info, Loader2, Image as ImageIcon, X, Trash2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { calculateCosts, CostBreakdown } from "@/lib/calculations"
import { CostSummary } from "@/components/quotes/cost-summary"
import { useState, useEffect, useMemo, useRef } from "react"
import { formatCurrency } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getExchangeRate } from "@/services/exchange-rate-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { DesignPartForm, PartFormValues } from "./design-part-form"
import { DesignPartsTable } from "./design-parts-table"
import { DesignExtraCostForm, ExtraCostFormValues } from "./design-extra-cost-form"
import { DesignExtraCostsTable } from "./design-extra-costs-table"
import Image from "next/image"

const PartSchema = z.object({
  id: z.string(),
  materialId: z.string().min(1, "Debes seleccionar un material."),
  materialGrams: z.coerce.number().min(0.01, "Los gramos deben ser mayor a 0."),
})

const DesignSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  parts: z.array(PartSchema).min(1, "Debes añadir al menos un material."),
  machineId: z.string().min(1, "Debes seleccionar una máquina."),
  designCost: z.coerce.number().optional(),
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
  photo1_base64: z.string().optional(),
  photo2_base64: z.string().optional(),
  mercadoLibreLink: z.string().url("URL no válida").optional().or(z.literal('')),
  instagramLink: z.string().url("URL no válida").optional().or(z.literal('')),
  link: z.string().url("URL no válida").optional().or(z.literal('')),
}).refine(data => (data.printHours || 0) + (data.printMinutes || 0) + (data.printSeconds || 0) > 0, {
  message: "El tiempo de impresión total debe ser mayor a 0.",
  path: ["printHours"], 
});


type DesignFormValues = z.infer<typeof DesignSchema>

interface DesignFormProps {
  design?: Design
}

export function DesignForm({ design }: DesignFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [designs, setDesigns] = useLocalStorage<Design[]>(LOCAL_STORAGE_KEYS.DESIGNS, [])
  const [machines, _, isMachinesHydrated] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES)
  const [materials, __, isMaterialsHydrated] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS)
  const [settings, ___, isSettingsHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)

  const [calculationResult, setCalculationResult] = useState<{ breakdown: CostBreakdown | null }>({ breakdown: null });
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(true);
  const [isPartFormOpen, setIsPartFormOpen] = useState(false);
  const [isExtraCostFormOpen, setIsExtraCostFormOpen] = useState(false);
  const [imageToView, setImageToView] = useState<string | null>(null);
  
  const photo1InputRef = useRef<HTMLInputElement>(null);
  const photo2InputRef = useRef<HTMLInputElement>(null);

  const form = useForm<DesignFormValues>({
    resolver: zodResolver(DesignSchema),
    defaultValues: design ? {
        ...design,
        printHours: design.printHours ? Math.floor(design.printHours) : 0,
        printMinutes: design.printHours ? Math.floor((design.printHours * 60) % 60) : 0,
        printSeconds: design.printHours ? Math.round((design.printHours * 3600) % 60) : 0,
        laborHours: design.laborHours ? Math.floor(design.laborHours) : 0,
        laborMinutes: design.laborHours ? Math.floor((design.laborHours * 60) % 60) : 0,
    } : {
        name: "",
        status: "draft",
        parts: [],
        machineId: machines.length > 0 ? machines[0].id : "",
        designCost: 0,
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
        photo1_base64: undefined,
        photo2_base64: undefined,
        mercadoLibreLink: '',
        instagramLink: '',
        link: '',
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
  const watchedPhoto1 = watch("photo1_base64");
  const watchedPhoto2 = watch("photo2_base64");

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
    
    const designDataForCalc = {
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
      designDataForCalc,
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


  const onSubmit = (data: DesignFormValues) => {
    const finalPrintHours = (data.printHours || 0) + ((data.printMinutes || 0) / 60) + ((data.printSeconds || 0) / 3600);
    const finalLaborHours = (data.laborHours || 0) + ((data.laborMinutes || 0) / 60);

    const designToSave: Design = {
      id: design?.id || generateId(),
      status: "draft",
      createdAt: design?.createdAt || new Date().toISOString(),
      name: data.name,
      parts: data.parts,
      machineId: data.machineId,
      designCost: data.designCost || 0,
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
      photo1_base64: data.photo1_base64,
      photo2_base64: data.photo2_base64,
      mercadoLibreLink: data.mercadoLibreLink,
      instagramLink: data.instagramLink,
      link: data.link,
    }

    if (design) {
      setDesigns(designs.map((d) => (d.id === design.id ? designToSave : d)))
      toast({ title: "Diseño actualizado" })
    } else {
      setDesigns([designToSave, ...designs])
      toast({ title: "Diseño creado" })
    }
    router.push("/designs")
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'photo1_base64' | 'photo2_base64') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setValue(field, loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
                <CardTitle>{design ? "Editar Diseño" : "Nuevo Diseño"}</CardTitle>
                <CardDescription>
                    {design ? 'Modifica los detalles para actualizar tu diseño.' : 'Completa los datos para calcular el costo de un diseño.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Diseño</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Engranaje para motor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Links de Publicación</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="mercadoLibreLink"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Mercado Libre</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="instagramLink"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                                <Input placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="sm:col-span-2">
                        <FormField
                            control={form.control}
                            name="link"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Otro Link (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                    </div>
                </CardContent>
            </Card>
            
            {/* Photos Card */}
            <Card>
              <CardHeader>
                <CardTitle>Fotos del Diseño</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Foto 1</FormLabel>
                  <div className="relative">
                    {watchedPhoto1 ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="relative h-32 w-full cursor-pointer group">
                                    <Image src={watchedPhoto1} alt="Preview 1" layout="fill" className="object-cover rounded-md border" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white font-semibold">Ampliar</p>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10" onClick={() => setValue('photo1_base64', undefined)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                             <DialogContent className="max-w-3xl">
                                <DialogHeader className="sr-only">
                                    <DialogTitle>Vista Previa de Imagen 1</DialogTitle>
                                </DialogHeader>
                                <Image src={watchedPhoto1} alt="Preview 1 Ampliada" width={800} height={800} className="rounded-md w-full h-auto" />
                            </DialogContent>
                        </Dialog>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="photo1-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span></p>
                            </div>
                            <input id="photo1-upload" ref={photo1InputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'photo1_base64')} />
                        </label>
                      </div> 
                    )}
                  </div>
                </div>
                 <div className="space-y-2">
                  <FormLabel>Foto 2</FormLabel>
                   <div className="relative">
                    {watchedPhoto2 ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="relative h-32 w-full cursor-pointer group">
                                    <Image src={watchedPhoto2} alt="Preview 2" layout="fill" className="object-cover rounded-md border" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white font-semibold">Ampliar</p>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10" onClick={() => setValue('photo2_base64', undefined)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader className="sr-only">
                                    <DialogTitle>Vista Previa de Imagen 2</DialogTitle>
                                </DialogHeader>
                                <Image src={watchedPhoto2} alt="Preview 2 Ampliada" width={800} height={800} className="rounded-md w-full h-auto" />
                            </DialogContent>
                        </Dialog>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="photo2-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span></p>
                            </div>
                             <input id="photo2-upload" ref={photo2InputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'photo2_base64')} />
                        </label>
                      </div> 
                    )}
                  </div>
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
                                <DesignPartForm materials={materials} onSubmit={handleAddPart} onCancel={() => setIsPartFormOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <DesignPartsTable parts={partsWithNames} onRemove={removePart} />
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
                          <DesignExtraCostForm onSubmit={handleAddExtraCost} onCancel={() => setIsExtraCostFormOpen(false)} />
                      </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
                <DesignExtraCostsTable costs={extraCostFields} onRemove={removeExtraCost} settings={settings} />
                <Separator />
                <FormField
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Añade notas internas..." {...field} />
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
                       {design ? "Guardar Cambios" : "Guardar Diseño"}
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
    </Form>
  )
}

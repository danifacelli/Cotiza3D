
"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Quote, Machine, Material, Settings, ExtraCost, QuotePart } from "@/lib/types"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, PlusCircle, FileDown, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { calculateCosts, CostBreakdown } from "@/lib/calculations"
import { CostSummary } from "@/components/quotes/cost-summary"
import { useState, useEffect, useMemo, useCallback } from "react"
import { formatCurrency } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

const PartSchema = z.object({
  id: z.string(),
  materialId: z.string().min(1, "Debes seleccionar un material."),
  materialGrams: z.coerce.number().min(0, "Los gramos deben ser un número positivo."),
})

const QuoteSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  clientName: z.string().optional(),
  parts: z.array(PartSchema).min(1, "Debes añadir al menos un material."),
  machineId: z.string().min(1, "Debes seleccionar una máquina."),
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
}).refine(data => (data.printHours || 0) + (data.printMinutes || 0) + (data.printSeconds || 0) > 0, {
  message: "El tiempo de impresión total debe ser mayor a 0.",
  path: ["printHours"], // You can point to any of the time fields
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
  
  const [calculationResult, setCalculationResult] = useState<{ breakdown: CostBreakdown | null; logs: string[] }>({ breakdown: null, logs: [] });

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(QuoteSchema),
    defaultValues: {
      name: quote?.name || "",
      clientName: quote?.clientName || "",
      parts: quote?.parts?.length ? quote.parts : [{ id: generateId(), materialId: "", materialGrams: 0 }],
      machineId: quote?.machineId || "",
      tariffType: quote?.tariffType || "off-peak",
      peakHours: quote?.peakHours || 0,
      extraCosts: quote?.extraCosts || [],
      notes: quote?.notes || "",
      printHours: quote?.printHours ? Math.floor(quote.printHours) : 0,
      printMinutes: quote?.printHours ? Math.floor((quote.printHours * 60) % 60) : 0,
      printSeconds: quote?.printHours ? Math.round((quote.printHours * 3600) % 60) : 0,
      laborHours: quote?.laborHours ? Math.floor(quote.laborHours) : 0,
      laborMinutes: quote?.laborHours ? Math.floor((quote.laborHours * 60) % 60) : 0,
    },
  })
  
  const { setValue, reset, getValues } = form;
  
  // Effect to add missing fields to legacy items in local storage
  useEffect(() => {
    if (isMachinesHydrated) {
        let machinesUpdated = false;
        const updatedMachines = machines.map(machine => {
            const needsUpdate = !('powerConsumption' in machine) || !('energyCostPerKwhDay' in machine);

            if (needsUpdate) {
                machinesUpdated = true;
                const updatedMachine = { ...machine } as any;
                 if (!('powerConsumption' in updatedMachine)) {
                  updatedMachine.powerConsumption = 0;
                }
                if (!('energyCostPerKwhDay' in updatedMachine)) {
                  updatedMachine.energyCostPerKwhDay = 0;
                }
                if (!('energyCostPerKwhNight' in updatedMachine)) {
                  updatedMachine.energyCostPerKwhNight = 0;
                }
                
                delete updatedMachine.powerConsumptionDay;
                delete updatedMachine.powerConsumptionNight;

                return updatedMachine;
            }
            return machine;
        });

        if (machinesUpdated) {
            setMachines(updatedMachines);
        }
    }
  }, [isMachinesHydrated, machines, setMachines]);

  
  const stableSetValue = useCallback(setValue, [setValue]);
  const stableGetValues = useCallback(getValues, [getValues]);
  const stableReset = useCallback(reset, [reset]);

  useEffect(() => {
    // This effect handles the initial form population for both 'new' and 'edit' modes.
    if (quote) {
      // EDIT MODE
      const totalPrintHours = quote.printHours || 0;
      const printHours = Math.floor(totalPrintHours);
      const printMinutes = Math.floor((totalPrintHours - printHours) * 60);
      const printSeconds = Math.round(((totalPrintHours - printHours) * 60 - printMinutes) * 60);

      const totalLaborHours = quote.laborHours || 0;
      const laborHours = Math.floor(totalLaborHours);
      const laborMinutes = Math.round((totalLaborHours - laborHours) * 60);

      stableReset({
        ...quote,
        printHours,
        printMinutes,
        printSeconds,
        laborHours,
        laborMinutes,
        extraCosts: quote.extraCosts || [],
      });
    } else if (isMaterialsHydrated && materials.length > 0 && isMachinesHydrated && machines.length > 0) {
      // NEW MODE - set defaults only when creating a new quote
      stableReset({
        ...stableGetValues(),
        parts: [{ id: generateId(), materialId: materials.length > 0 ? materials[0].id : "", materialGrams: 0 }],
        machineId: machines.length > 0 ? machines[0].id : "",
        name: "",
        clientName: "",
        tariffType: "off-peak",
        peakHours: 0,
        extraCosts: [],
        notes: "",
        printHours: 0,
        printMinutes: 0,
        printSeconds: 0,
        laborHours: 0,
        laborMinutes: 0,
      });
    }
  }, [quote, isMaterialsHydrated, isMachinesHydrated, materials, machines, stableReset, stableGetValues]);
  

  const { fields: partFields, append: appendPart, remove: removePart } = useFieldArray({
    control: form.control,
    name: "parts",
  })

  const { fields: extraCostFields, append: appendExtraCost, remove: removeExtraCost } = useFieldArray({
    control: form.control,
    name: "extraCosts",
  })

  const watchedValues = form.watch()
  const printHoursDecimal = (Number(watchedValues.printHours) || 0) + ((Number(watchedValues.printMinutes) || 0) / 60) + ((Number(watchedValues.printSeconds) || 0) / 3600);
  const laborHoursDecimal = (Number(watchedValues.laborHours) || 0) + ((Number(watchedValues.laborMinutes) || 0) / 60);
  
  useEffect(() => {
    const isReady =
      watchedValues.machineId &&
      isMachinesHydrated &&
      isMaterialsHydrated &&
      isSettingsHydrated;

    if (!isReady) {
      setCalculationResult({ breakdown: null, logs: ["Esperando datos para calcular..."] });
      return;
    }
    
    const result = calculateCosts(
      { ...watchedValues, printHours: printHoursDecimal, laborHours: laborHoursDecimal },
      materials,
      machines,
      settings
    );
    setCalculationResult(result);
  }, [
    printHoursDecimal,
    laborHoursDecimal,
    watchedValues, // Watch the entire object for simplicity
    settings,
    materials,
    machines,
    isMachinesHydrated,
    isMaterialsHydrated,
    isSettingsHydrated,
  ]);


  const materialSummary = useMemo(() => {
    const totalGrams = watchedValues.parts?.reduce((acc, part) => {
        const parsedGrams = parseFloat(part.materialGrams as any);
        return acc + (isNaN(parsedGrams) ? 0 : parsedGrams);
    }, 0) || 0;
    
    const totalCost = watchedValues.parts?.reduce((acc, part) => {
      const material = materials.find(m => m.id === part.materialId);
      const parsedGrams = parseFloat(part.materialGrams as any);
      if (material && !isNaN(parsedGrams) && parsedGrams > 0) {
        return acc + (parsedGrams / 1000) * material.cost;
      }
      return acc;
    }, 0) || 0;

    return { totalGrams, totalCost };
  }, [watchedValues.parts, materials]);
  
  const selectedMachine = useMemo(() => {
    return machines.find(m => m.id === watchedValues.machineId);
  }, [machines, watchedValues.machineId]);


  const onSubmit = (data: QuoteFormValues) => {
    const finalPrintHours = (data.printHours || 0) + ((data.printMinutes || 0) / 60) + ((data.printSeconds || 0) / 3600);
    const finalLaborHours = (data.laborHours || 0) + ((data.laborMinutes || 0) / 60);

    const quoteToSave: Quote = {
      id: quote?.id || generateId(),
      status: quote?.status || "draft",
      createdAt: quote?.createdAt || new Date().toISOString(),
      name: data.name,
      clientName: data.clientName || "",
      parts: data.parts,
      machineId: data.machineId,
      printHours: finalPrintHours,
      tariffType: data.tariffType,
      peakHours: data.peakHours,
      laborHours: finalLaborHours,
      extraCosts: data.extraCosts || [],
      notes: data.notes || "",
    }

    if (quote) {
      // Editing
      setQuotes(quotes.map((q) => (q.id === quote.id ? quoteToSave : q)))
      toast({ title: "Presupuesto actualizado" })
    } else {
      // Creating
      setQuotes([quoteToSave, ...quotes])
      toast({ title: "Presupuesto creado" })
    }
    router.push("/quotes")
  }

  const handleGeneratePdf = () => {
    toast({
      title: "Funcionalidad no disponible",
      description: "La generación de PDF se implementará en el futuro.",
      variant: "destructive"
    })
  }
  
  const energyTariffDescription = useMemo(() => {
    if (!settings) return null;

    const { 
      peakTariffStartTime, 
      peakTariffEndTime, 
      peakEnergyCostKwh, 
      offPeakEnergyCostKwh 
    } = settings;

    const tariffType = watchedValues.tariffType;

    switch (tariffType) {
      case 'peak':
        return `Punta (${peakTariffStartTime} - ${peakTariffEndTime}): ${formatCurrency(peakEnergyCostKwh, "USD", 3)}/kWh.`;
      case 'off-peak':
        return `Fuera de Punta: ${formatCurrency(offPeakEnergyCostKwh, "USD", 3)}/kWh.`;
      case 'mixed':
         return `Punta (${peakTariffStartTime} - ${peakTariffEndTime}): ${formatCurrency(peakEnergyCostKwh, "USD", 3)}/kWh. Resto: ${formatCurrency(offPeakEnergyCostKwh, "USD", 3)}/kWh.`;
      default:
        return null;
    }
  }, [watchedValues.tariffType, settings]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 grid gap-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{quote ? "Editar Presupuesto" : "Nuevo Presupuesto"}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6">
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
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Cliente (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        control={form.control}
                        name="machineId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Máquina</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
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
              </CardContent>
            </Card>
            
            {/* Materials Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Materiales</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                     {partFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 items-start p-4 border rounded-md relative">
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => removePart(index)}
                                disabled={partFields.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <FormField
                            control={form.control}
                            name={`parts.${index}.materialId`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Material</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un material" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {materials.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                        {m.name} ({m.type})
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name={`parts.${index}.materialGrams`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Gramos</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.1" placeholder="Ej: 150" {...field} className="w-28" onFocus={(e) => e.target.select()} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                    ))}
                    <FormMessage>{form.formState.errors.parts?.root?.message}</FormMessage>

                    {materialSummary.totalGrams > 0 && (
                        <Alert variant="default" className="mt-4">
                            <AlertDescription className="flex justify-between items-center text-sm">
                                <span>Total Gramos: <strong>{materialSummary.totalGrams.toFixed(2)} g</strong></span>
                                {calculationResult.breakdown && <span>Costo de Material: <strong>{formatCurrency(calculationResult.breakdown.materialCost, "USD", settings.currencyDecimalPlaces)}</strong></span>}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendPart({ id: generateId(), materialId: materials.length > 0 ? materials[0].id : "", materialGrams: 0 })}
                    >
                        <PlusCircle className="mr-2" /> Añadir Material
                    </Button>
                </CardContent>
            </Card>

            {/* Extra Costs & Notes Card */}
            <Card>
              <CardHeader>
                <CardTitle>Costos Adicionales y Notas</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div>
                  <FormLabel>Costos Adicionales</FormLabel>
                  <div className="space-y-4 mt-2">
                    {extraCostFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`extraCosts.${index}.description`}
                          render={({ field }) => (
                            <Input {...field} placeholder="Descripción" className="flex-grow" />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`extraCosts.${index}.amount`}
                          render={({ field }) => (
                            <Input type="number" step="0.01" {...field} placeholder="Monto (USD)" />
                          )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeExtraCost(index)}>
                          <Trash2 className="text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => appendExtraCost({ id: generateId(), description: "", amount: 0 })}
                  >
                    <PlusCircle className="mr-2" /> Añadir Costo
                  </Button>
                </div>
                <Separator />
                <FormField
                  control={form.control}
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

          {/* Cost Summary Section */}
          <div className="md:col-span-1 sticky top-20">
            <CostSummary
                breakdown={calculationResult.breakdown}
                settings={settings}
                machine={selectedMachine}
                quoteInput={{...watchedValues, printHours: printHoursDecimal}}
                logs={calculationResult.logs}
                actions={
                  <>
                     <Button type="submit" className="w-full">
                       {quote ? "Guardar Cambios" : "Guardar Presupuesto"}
                     </Button>
                     <Button type="button" variant="secondary" className="w-full" onClick={handleGeneratePdf}>
                       <FileDown className="mr-2" />
                       Generar PDF
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

    
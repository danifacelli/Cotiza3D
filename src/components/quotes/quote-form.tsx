
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
import { Trash2, PlusCircle, FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { calculateCosts, CostBreakdown } from "@/lib/calculations"
import { CostSummary } from "@/components/quotes/cost-summary"
import { useState, useEffect, useMemo } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

const PartSchema = z.object({
  id: z.string(),
  materialId: z.string().min(1, "Debes seleccionar un material."),
  materialGrams: z.coerce.number().min(0.1, "Los gramos deben ser mayor a 0."),
})

const QuoteSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  clientName: z.string().optional(),
  parts: z.array(PartSchema).min(1, "Debes añadir al menos un material."),
  machineId: z.string().min(1, "Debes seleccionar una máquina."),
  printTime: z.coerce.number().min(0.1, "El tiempo debe ser mayor a 0."),
  extraCosts: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1, "La descripción es requerida."),
      amount: z.coerce.number().min(0, "El monto no puede ser negativo."),
    })
  ).optional(),
  notes: z.string().optional(),
})

type QuoteFormValues = z.infer<typeof QuoteSchema>

interface QuoteFormProps {
  quote?: Quote
}

export function QuoteForm({ quote }: QuoteFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [quotes, setQuotes] = useLocalStorage<Quote[]>(LOCAL_STORAGE_KEYS.QUOTES, [])
  const [machines, _, isMachinesHydrated] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES)
  const [materials, __, isMaterialsHydrated] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS)
  const [settings] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  
  const [timeUnit, setTimeUnit] = useState("minutes");

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(QuoteSchema),
    defaultValues: {
      name: quote?.name || "",
      clientName: quote?.clientName || "",
      parts: quote?.parts?.length ? quote.parts : [{ id: generateId(), materialId: "", materialGrams: 0 }],
      machineId: quote?.machineId || "",
      printTime: quote?.printHours || 0,
      extraCosts: quote?.extraCosts || [],
      notes: quote?.notes || "",
    },
  })
  
  useEffect(() => {
    if (quote?.printHours) {
        if (quote.printHours < 1 && quote.printHours > 0) {
            setTimeUnit("minutes");
            form.setValue("printTime", quote.printHours * 60);
        } else {
            setTimeUnit("hours");
            form.setValue("printTime", quote.printHours);
        }
    } else {
        setTimeUnit("minutes");
    }
  }, [quote, form.setValue]);
  
   useEffect(() => {
    if (!quote && isMaterialsHydrated && materials.length > 0) {
      const parts = form.getValues('parts');
      if (parts.length === 1 && !parts[0].materialId) {
        form.setValue('parts.0.materialId', materials[0].id, { shouldValidate: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMaterialsHydrated, materials, quote]);


  const { fields: partFields, append: appendPart, remove: removePart } = useFieldArray({
    control: form.control,
    name: "parts",
  })

  const { fields: extraCostFields, append: appendExtraCost, remove: removeExtraCost } = useFieldArray({
    control: form.control,
    name: "extraCosts",
  })

  const watchedValues = form.watch()
  const printHours = timeUnit === 'hours' ? watchedValues.printTime : (watchedValues.printTime || 0) / 60;
  
  const costBreakdown: CostBreakdown | null = calculateCosts(
    { ...watchedValues, printHours, parts: watchedValues.parts },
    materials,
    machines,
    settings
  )

  const materialSummary = useMemo(() => {
    const totalGrams = watchedValues.parts?.reduce((acc, part) => acc + (part.materialGrams || 0), 0) || 0;
    
    const totalCost = watchedValues.parts?.reduce((acc, part) => {
      const material = materials.find(m => m.id === part.materialId);
      if (material && part.materialGrams > 0) {
        return acc + (part.materialGrams / 1000) * material.cost;
      }
      return acc;
    }, 0) || 0;

    return { totalGrams, totalCost };
  }, [watchedValues.parts, materials]);


  const onSubmit = (data: QuoteFormValues) => {
    const finalPrintHours = timeUnit === 'hours' ? data.printTime : (data.printTime || 0) / 60;

    const quoteToSave: Quote = {
      id: quote?.id || generateId(),
      status: quote?.status || "draft",
      createdAt: quote?.createdAt || new Date().toISOString(),
      name: data.name,
      clientName: data.clientName || "",
      parts: data.parts,
      machineId: data.machineId,
      printHours: finalPrintHours,
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
                <CardTitle>Detalles de Impresión</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                    <FormLabel>Tiempo de Impresión</FormLabel>
                    <div className="flex gap-2">
                        <FormField
                        control={form.control}
                        name="printTime"
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                            <FormControl>
                                <Input type="number" step="0.1" placeholder={timeUnit === 'hours' ? "Ej: 8.5" : "Ej: 510"} {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <RadioGroup
                            value={timeUnit}
                            onValueChange={setTimeUnit}
                            className="flex items-center space-x-2"
                        >
                            <div className="flex items-center space-x-1">
                                <RadioGroupItem value="hours" id="hours" />
                                <FormLabel htmlFor="hours" className="font-normal cursor-pointer">Horas</FormLabel>
                            </div>
                            <div className="flex items-center space-x-1">
                                <RadioGroupItem value="minutes" id="minutes" />
                                <FormLabel htmlFor="minutes" className="font-normal cursor-pointer">Minutos</FormLabel>
                            </div>
                        </RadioGroup>
                    </div>
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
                                    <Input type="number" step="0.1" placeholder="Ej: 150" {...field} className="w-28"/>
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
                                <span>Costo de Material: <strong>{formatCurrency(materialSummary.totalCost, "USD", 'es-UY', true)}</strong></span>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendPart({ id: generateId(), materialId: "", materialGrams: 0 })}
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
                breakdown={costBreakdown}
                settings={settings}
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

    

    
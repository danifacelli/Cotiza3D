
"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Quote, Machine, Material, Settings, ExtraCost } from "@/lib/types"
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
import { Trash2, PlusCircle, FileDown, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { calculateCosts, CostBreakdown } from "@/lib/calculations"
import { CostSummary } from "@/components/quotes/cost-summary"

const QuoteSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  clientName: z.string().optional(),
  materialId: z.string().min(1, "Debes seleccionar un material."),
  materialGrams: z.coerce.number().min(0.1, "Los gramos deben ser mayor a 0."),
  machineId: z.string().min(1, "Debes seleccionar una máquina."),
  printHours: z.coerce.number().min(0.1, "Las horas deben ser mayor a 0."),
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
  const [machines] = useLocalStorage<Machine[]>(LOCAL_STORAGE_KEYS.MACHINES, DEFAULT_MACHINES)
  const [materials] = useLocalStorage<Material[]>(LOCAL_STORAGE_KEYS.MATERIALS, DEFAULT_MATERIALS)
  const [settings] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(QuoteSchema),
    defaultValues: {
      name: quote?.name || "",
      clientName: quote?.clientName || "",
      materialId: quote?.materialId || "",
      materialGrams: quote?.materialGrams || 0,
      machineId: quote?.machineId || "",
      printHours: quote?.printHours || 0,
      extraCosts: quote?.extraCosts || [],
      notes: quote?.notes || "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "extraCosts",
  })

  const watchedValues = form.watch()
  const costBreakdown: CostBreakdown | null = calculateCosts(
    watchedValues,
    materials,
    machines,
    settings,
    settings
  )

  const onSubmit = (data: QuoteFormValues) => {
    const quoteToSave: Quote = {
      id: quote?.id || generateId(),
      status: quote?.status || "draft",
      createdAt: quote?.createdAt || new Date().toISOString(),
      ...data,
      // Make sure extraCosts is always an array
      extraCosts: data.extraCosts || [],
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
                <CardTitle>{quote ? "Editar Presupuesto" : "Nuevo Presupuesto"}</CardTitle>
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
                <FormField
                  control={form.control}
                  name="materialId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="materialGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gramos de Material</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="Ej: 150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="printHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas de Impresión</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="Ej: 8.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                    {fields.map((field, index) => (
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
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
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
                    onClick={() => append({ id: generateId(), description: "", amount: 0 })}
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

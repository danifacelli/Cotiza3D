
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { FuturePurchase } from "@/lib/types"

const FormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  description: z.string().optional(),
  link: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  priceUSD: z.coerce.number().min(0, "El precio no puede ser negativo."),
})

export type FuturePurchaseFormValues = z.infer<typeof FormSchema>

interface FuturePurchaseFormProps {
  onSubmit: (data: FuturePurchaseFormValues) => void
  onCancel: () => void
  defaultValues?: Partial<FuturePurchase> | null
}

export function FuturePurchaseForm({ onSubmit, onCancel, defaultValues }: FuturePurchaseFormProps) {
  const form = useForm<FuturePurchaseFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      link: defaultValues?.link || "",
      priceUSD: defaultValues?.priceUSD || 0,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Artículo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Filamento PETG Negro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción Adicional (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Anota detalles importantes, especificaciones, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priceUSD"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio (USD)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormDescription>
                Costo estimado o final del artículo en dólares.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enlace (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
               <FormDescription>
                URL del producto para referencia futura.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  )
}

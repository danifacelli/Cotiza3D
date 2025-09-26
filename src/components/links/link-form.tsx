
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { LinkItem } from "@/lib/types"

const FormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  link: z.string().url("Debe ser una URL válida."),
  description: z.string().optional(),
})

export type LinkFormValues = z.infer<typeof FormSchema>

interface LinkFormProps {
  onSubmit: (data: LinkFormValues) => void
  onCancel: () => void
  defaultValues?: Partial<LinkItem> | null
}

export function LinkForm({ onSubmit, onCancel, defaultValues }: LinkFormProps) {
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      link: defaultValues?.link || "",
      description: defaultValues?.description || "",
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
              <FormLabel>Nombre / Descripción Corta</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Modelo de engranaje" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enlace (URL)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
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
              <FormLabel>Descripción Avanzada (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Anota detalles importantes, para qué sirve, etc." {...field} />
              </FormControl>
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

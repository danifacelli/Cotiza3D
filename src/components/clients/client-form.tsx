
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import type { Client } from "@/lib/types"

const FormSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  phone: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
})

export type ClientFormValues = z.infer<typeof FormSchema>

interface ClientFormProps {
  onSubmit: (data: ClientFormValues) => void
  onCancel: () => void
  defaultValues?: Partial<Client> | null
}

export function ClientForm({ onSubmit, onCancel, defaultValues }: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      phone: defaultValues?.phone || "",
      instagram: defaultValues?.instagram || "",
      facebook: defaultValues?.facebook || "",
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
              <FormLabel>Nombre del Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: +598 99 123 456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: @usuario" {...field} />
              </FormControl>
               <FormDescription>Solo el nombre de usuario, sin la URL completa.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facebook (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: juan.perez" {...field} />
              </FormControl>
               <FormDescription>El nombre de usuario o perfil de Facebook.</FormDescription>
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

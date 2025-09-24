
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
import type { Investment } from "@/lib/types"

const InvestmentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  amount: z.coerce.number().positive("El monto debe ser un número positivo."),
})

type InvestmentFormValues = z.infer<typeof InvestmentSchema>

interface InvestmentFormProps {
  onSubmit: (data: InvestmentFormValues) => void
  onCancel: () => void
  defaultValues?: Investment | null
}

export function InvestmentForm({ onSubmit, onCancel, defaultValues }: InvestmentFormProps) {
  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(InvestmentSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      amount: defaultValues?.amount || 0,
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
              <FormLabel>Nombre de la Inversión</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Impresora 3D, Herramientas" {...field} />
              </FormControl>
              <FormDescription>
                Un nombre para identificar tu inversión.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto (USD)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormDescription>
                Costo total de la inversión en dólares.
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

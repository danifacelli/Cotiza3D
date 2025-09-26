
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const ExtraCostFormSchema = z.object({
  description: z.string().min(1, "La descripción es requerida."),
  amount: z.coerce.number().min(0, "El monto no puede ser negativo."),
})

export type ExtraCostFormValues = z.infer<typeof ExtraCostFormSchema>

interface DesignExtraCostFormProps {
  onSubmit: (data: ExtraCostFormValues) => void
  onCancel: () => void
  defaultValues?: Partial<ExtraCostFormValues>
}

export function DesignExtraCostForm({ onSubmit, onCancel, defaultValues }: DesignExtraCostFormProps) {
  const form = useForm<ExtraCostFormValues>({
    resolver: zodResolver(ExtraCostFormSchema),
    defaultValues: {
      description: defaultValues?.description || "",
      amount: defaultValues?.amount || 0,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(onSubmit)(); }} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Post-procesado, pintura" {...field} />
              </FormControl>
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
                <Input type="number" step="0.01" placeholder="Ej: 10.50" {...field} onFocus={(e) => e.target.select()} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Añadir</Button>
        </div>
      </form>
    </Form>
  )
}

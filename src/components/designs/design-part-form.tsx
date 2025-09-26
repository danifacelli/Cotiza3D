
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Material } from "@/lib/types"

const PartFormSchema = z.object({
  materialId: z.string().min(1, "Debes seleccionar un material."),
  materialGrams: z.coerce.number().min(0.01, "El peso debe ser mayor a 0."),
})

export type PartFormValues = z.infer<typeof PartFormSchema>

interface DesignPartFormProps {
  materials: Material[]
  onSubmit: (data: PartFormValues) => void
  onCancel: () => void
  defaultValues?: Partial<PartFormValues>
}

export function DesignPartForm({ materials, onSubmit, onCancel, defaultValues }: DesignPartFormProps) {
  const form = useForm<PartFormValues>({
    resolver: zodResolver(PartFormSchema),
    defaultValues: {
      materialId: defaultValues?.materialId || (materials.length > 0 ? materials[0].id : ""),
      materialGrams: defaultValues?.materialGrams || 0,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="materialId"
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
            name="materialGrams"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Peso (g)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.1" placeholder="Ej: 150" {...field} onFocus={(e) => e.target.select()} />
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

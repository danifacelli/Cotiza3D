
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
import type { Machine } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Settings } from "@/lib/types"
import { DEFAULT_SETTINGS } from "@/lib/defaults"

const MachineSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  costPerHour: z.coerce.number().min(0, "El costo debe ser un número positivo."),
  powerConsumption: z.coerce.number().min(0, "El consumo debe ser un número positivo."),
})

type MachineFormValues = z.infer<typeof MachineSchema>

interface MachineFormProps {
  onSubmit: (data: MachineFormValues) => void
  onCancel: () => void
  defaultValues?: Machine | null
}

export function MachineForm({ onSubmit, onCancel, defaultValues }: MachineFormProps) {
  const [settings] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  const form = useForm<MachineFormValues>({
    resolver: zodResolver(MachineSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      costPerHour: defaultValues?.costPerHour || 0,
      powerConsumption: defaultValues?.powerConsumption || 0,
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
              <FormLabel>Nombre de la Máquina</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Creality Ender 3 V2" {...field} />
              </FormControl>
              <FormDescription>
                Un nombre para identificar tu impresora.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="costPerHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo de Depreciación por Hora ({settings.currencyCode})</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormDescription>
                Costo asociado al desgaste y mantenimiento de la máquina por cada hora de uso.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="powerConsumption"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Consumo de Energía (Watts)</FormLabel>
              <FormControl>
                <Input type="number" step="1" {...field} />
              </FormControl>
               <FormDescription>
                Potencia promedio que consume la impresora durante la operación.
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

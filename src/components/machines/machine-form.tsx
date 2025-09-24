
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
import { Search } from "lucide-react"
import Link from "next/link"

const MachineSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  costPerHour: z.coerce.number().min(0, "El costo debe ser un número positivo."),
  powerConsumption: z.coerce.number().int("El consumo debe ser un número entero.").min(0, "El consumo debe ser un número positivo."),
})

type MachineFormValues = z.infer<typeof MachineSchema>

interface MachineFormProps {
  onSubmit: (data: MachineFormValues) => void
  onCancel: () => void
  defaultValues?: Machine | null
}

export function MachineForm({ onSubmit, onCancel, defaultValues }: MachineFormProps) {
  const form = useForm<MachineFormValues>({
    resolver: zodResolver(MachineSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      costPerHour: defaultValues?.costPerHour || 0,
      powerConsumption: defaultValues?.powerConsumption || 0,
    },
  })
  
  const machineName = form.watch("name");
  const powerConsumptionSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(machineName || "")}+consumo+de+energia+watts`;
  const depreciationSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`calcular depreciación impresora 3d ${machineName || ""}`)}`;


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
              <FormLabel>Costo de Depreciación por Hora (USD)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormDescription>
                Costo asociado al desgaste y mantenimiento. Se calcula dividiendo el precio de la máquina entre su vida útil estimada en horas.
              </FormDescription>
               {machineName && (
                 <Button variant="link" size="sm" asChild className="p-0 h-auto mt-2 text-xs">
                    <Link href={depreciationSearchUrl} target="_blank">
                        <Search className="mr-1" />
                        Buscar cómo calcular la depreciación en Google
                    </Link>
                </Button>
              )}
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
                    {machineName && (
                    <Button variant="link" size="sm" asChild className="p-0 h-auto mt-2 text-xs d-block">
                        <Link href={powerConsumptionSearchUrl} target="_blank">
                            <Search className="mr-1" />
                            Buscar consumo de "{machineName}" en Google
                        </Link>
                    </Button>
                    )}
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

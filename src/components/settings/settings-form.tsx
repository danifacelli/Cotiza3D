
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
import type { Settings } from "@/lib/types"

export const SettingsSchema = z.object({
  companyName: z.string().min(1, "El nombre es requerido"),
  companyContact: z.string().email("Debe ser un email válido"),
  laborCostPerHour: z.coerce.number().min(0, "Debe ser un número positivo"),
  profitMargin: z.coerce.number().min(0, "Debe ser un número positivo"),
  currencyDecimalPlaces: z.coerce.number().min(0).max(4, "Puede ser entre 0 y 4"),
})

interface SettingsFormProps {
  defaultValues: Settings;
  onSave: (data: Settings) => void;
}

export function SettingsForm({ defaultValues, onSave }: SettingsFormProps) {
  const form = useForm<Settings>({
    resolver: zodResolver(SettingsSchema),
    defaultValues,
  })

  function onSubmit(data: Settings) {
    onSave(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                 <h3 className="text-lg font-medium">Empresa</h3>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu Empresa de 3D" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de Contacto</FormLabel>
                      <FormControl>
                        <Input placeholder="contacto@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Costos y Ganancias</h3>
                <FormField
                  control={form.control}
                  name="laborCostPerHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo de Mano de Obra (por hora, USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="profitMargin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Margen de Ganancia (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="space-y-4">
                <h3 className="text-lg font-medium">Regional</h3>
                 <FormField
                  control={form.control}
                  name="currencyDecimalPlaces"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precisión Decimal Moneda</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="4" step="1" {...field} />
                      </FormControl>
                       <FormDescription>
                        El número de decimales a mostrar para los precios (0-4).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
        </div>
        <Button type="submit">Guardar Cambios</Button>
      </form>
    </Form>
  )
}

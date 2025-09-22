
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export const SettingsSchema = z.object({
  companyName: z.string().min(1, "El nombre es requerido"),
  companyContact: z.string().email("Debe ser un email válido"),
  laborCostPerHour: z.coerce.number().min(0, "Debe ser un número positivo"),
  profitMargin: z.coerce.number().min(0, "Debe ser un número positivo"),
  currencyDecimalPlaces: z.coerce.number().min(0, "Puede ser entre 0 y 4").max(4),
  peakEnergyCostKwh: z.coerce.number().min(0, "Debe ser un número positivo"),
  offPeakEnergyCostKwh: z.coerce.number().min(0, "Debe ser un número positivo"),
  tariffSource: z.string().optional(),
  tariffLastUpdated: z.string().optional(),
})

interface SettingsFormProps {
  defaultValues: Settings;
  onSave: (data: Settings) => void;
}

export function SettingsForm({ defaultValues, onSave }: SettingsFormProps) {
  const form = useForm<Settings>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      ...defaultValues,
      companyName: defaultValues?.companyName ?? '',
      companyContact: defaultValues?.companyContact ?? '',
      laborCostPerHour: defaultValues?.laborCostPerHour ?? 0,
      profitMargin: defaultValues?.profitMargin ?? 0,
      currencyDecimalPlaces: defaultValues?.currencyDecimalPlaces ?? 2,
      peakEnergyCostKwh: defaultValues?.peakEnergyCostKwh ?? 0.351,
      offPeakEnergyCostKwh: defaultValues?.offPeakEnergyCostKwh ?? 0.139,
      tariffSource: defaultValues?.tariffSource ?? '',
      tariffLastUpdated: defaultValues?.tariffLastUpdated ?? '',
    }
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
             <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Costos de Energía</h3>
                 <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>¿De dónde salen estos valores?</AlertTitle>
                    <AlertDescription>
                        Estos costos los fija tu proveedor de energía. La **Tarifa Punta** suele ser un bloque de ~4 horas por la tarde/noche en días hábiles, donde la energía es más cara. El resto del tiempo aplica la tarifa **Fuera de Punta**. Consulta tu factura o la web de tu proveedor para obtener los valores exactos para tu región.
                        <br />
                        La fórmula es: `Costo Energía = (Potencia Watts / 1000) * Horas de Impresión * Tarifa kWh`
                    </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="peakEnergyCostKwh"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Costo Energía Tarifa Punta (USD/kWh)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.001" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="offPeakEnergyCostKwh"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Costo Energía Fuera de Punta (USD/kWh)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.001" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                        control={form.control}
                        name="tariffSource"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Fuente de la Tarifa</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Factura UTE, Enero 2024" {...field} />
                            </FormControl>
                             <FormDescription>
                                Anota de dónde obtuviste los valores.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="tariffLastUpdated"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Fecha de Actualización</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                                ¿Cuándo consultaste la tarifa por última vez?
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
            </div>
        </div>
        <Button type="submit">Guardar Cambios</Button>
      </form>
    </Form>
  )
}

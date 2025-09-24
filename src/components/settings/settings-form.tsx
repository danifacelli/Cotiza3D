
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LATAM_CURRENCIES } from "@/lib/constants"

export const SettingsSchema = z.object({
  companyName: z.string().min(1, "El nombre es requerido"),
  companyContact: z.string().email("Debe ser un email válido"),
  companyInstagram: z.string().optional(),
  laborCostPerHour: z.coerce.number().min(0, "Debe ser un número positivo"),
  profitMargin: z.coerce.number().min(0, "Debe ser un número positivo"),
  currencyDecimalPlaces: z.coerce.number().min(0, "Puede ser entre 0 y 4").max(4),
  localCurrency: z.string().min(3, "Debes seleccionar una moneda."),
  peakEnergyCostKwh: z.coerce.number().min(0, "Debe ser un número positivo"),
  offPeakEnergyCostKwh: z.coerce.number().min(0, "Debe ser un número positivo"),
  tariffSource: z.string().optional(),
  tariffLastUpdated: z.string().optional(),
  peakTariffStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:mm)"),
  peakTariffEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:mm)"),
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
      companyInstagram: defaultValues?.companyInstagram ?? '',
      laborCostPerHour: defaultValues?.laborCostPerHour ?? 0,
      profitMargin: defaultValues?.profitMargin ?? 0,
      currencyDecimalPlaces: defaultValues?.currencyDecimalPlaces ?? 2,
      localCurrency: defaultValues?.localCurrency ?? 'UYU',
      peakEnergyCostKwh: defaultValues?.peakEnergyCostKwh ?? 0.351,
      offPeakEnergyCostKwh: defaultValues?.offPeakEnergyCostKwh ?? 0.139,
      tariffSource: defaultValues?.tariffSource ?? '',
      tariffLastUpdated: defaultValues?.tariffLastUpdated ?? '',
      peakTariffStartTime: defaultValues?.peakTariffStartTime ?? '17:00',
      peakTariffEndTime: defaultValues?.peakTariffEndTime ?? '23:00',
    }
  })

  function onSubmit(data: Settings) {
    onSave(data)
  }
  
  const peakStart = form.watch("peakTariffStartTime");
  const peakEnd = form.watch("peakTariffEndTime");

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
                 <FormField
                  control={form.control}
                  name="companyInstagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram (usuario)</FormLabel>
                      <FormControl>
                        <Input placeholder="tu_usuario_de_instagram" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Costos y Moneda</h3>
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
                    name="localCurrency"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Moneda Local</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una moneda" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {LATAM_CURRENCIES.map((currency) => (
                                <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            La moneda que se usará para mostrar el precio final convertido.
                        </FormDescription>
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
                        Estos costos los fija tu proveedor de energía. La **Tarifa Punta** ({peakStart} a {peakEnd}) es un bloque horario en días hábiles donde la energía es más cara. El resto del tiempo aplica la tarifa **Fuera de Punta**. Consulta tu factura o la web de tu proveedor para obtener los valores exactos.
                        <br />
                        La fórmula es: `Costo = (Potencia Watts / 1000) * Horas de Impresión * Tarifa kWh`
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
                        name="peakTariffStartTime"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Inicio Horario Punta</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} />
                            </FormControl>
                             <FormDescription>
                                Comienzo del horario de tarifa cara.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="peakTariffEndTime"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Fin Horario Punta</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} />
                            </FormControl>
                            <FormDescription>
                                Fin del horario de tarifa cara.
                            </FormDescription>
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

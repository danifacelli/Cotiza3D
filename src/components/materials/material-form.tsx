
"use client"

import { useState, useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Material } from "@/lib/types"
import { FILAMENT_TYPES } from "@/lib/constants"
import { Alert, AlertDescription } from "@/components/ui/alert"

const SpoolWeightSchema = z.object({
  spoolWeight: z.coerce.number().positive("El peso debe ser mayor a 0."),
  spoolCost: z.coerce.number().min(0, "El costo no puede ser negativo."),
})

const MaterialSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  type: z.string().min(1, "Debes seleccionar un tipo."),
  cost: z.coerce.number().min(0, "El costo debe ser un número positivo."),
}).merge(SpoolWeightSchema.partial()) // spool fields are optional for editing

type MaterialFormValues = z.infer<typeof MaterialSchema>

interface MaterialFormProps {
  onSubmit: (data: Omit<Material, 'id'>) => void
  onCancel: () => void
  defaultValues?: Material | null
}

export function MaterialForm({ onSubmit, onCancel, defaultValues }: MaterialFormProps) {
  const [selectedTypeDescription, setSelectedTypeDescription] = useState<string | undefined>("");
  const [calculatedCost, setCalculatedCost] = useState<number | null>(defaultValues?.cost ?? null);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(MaterialSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "",
      cost: defaultValues?.cost || 0,
      spoolWeight: 1000,
      spoolCost: defaultValues ? defaultValues.cost : 0,
    },
  })

  const { watch, setValue } = form;
  const spoolWeight = watch('spoolWeight');
  const spoolCost = watch('spoolCost');

  useEffect(() => {
    if (defaultValues?.type) {
      const initialType = FILAMENT_TYPES.find(t => t.value === defaultValues.type);
      setSelectedTypeDescription(initialType?.description);
    }
  }, [defaultValues]);

  useEffect(() => {
    if (spoolWeight && spoolCost !== undefined && spoolWeight > 0) {
      const costPerKg = (spoolCost / spoolWeight) * 1000;
      setCalculatedCost(costPerKg);
      setValue('cost', parseFloat(costPerKg.toFixed(2)));
    } else {
      setCalculatedCost(null);
    }
  }, [spoolWeight, spoolCost, setValue]);

  const handleTypeChange = (value: string) => {
    const selectedType = FILAMENT_TYPES.find(t => t.value === value);
    setSelectedTypeDescription(selectedType?.description);
    form.setValue("type", value);
  }

  const isEditing = !!defaultValues;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Material</FormLabel>
              <FormControl>
                <Input placeholder="Ej: PLA Rojo Intenso" {...field} />
              </FormControl>
              <FormDescription>
                Un nombre descriptivo para identificar el filamento.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Filamento</FormLabel>
              <Select onValueChange={handleTypeChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FILAMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
               {selectedTypeDescription && (
                <FormDescription className="pt-2 text-foreground/80">
                  {selectedTypeDescription}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing ? (
          <div className="space-y-4 rounded-md border p-4">
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="spoolWeight"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Peso del Rollo (g)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="spoolCost"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Precio del Rollo (USD)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="25.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            {calculatedCost !== null && (
                 <Alert variant="default" className="text-sm">
                    <AlertDescription>
                        Costo calculado por kg: <strong>${calculatedCost.toFixed(2)} USD</strong>. Este valor se guardará.
                    </AlertDescription>
                </Alert>
            )}
            <FormDescription>
                Ingresa el peso del rollo en gramos y lo que te costó. El sistema calculará el precio por kg automáticamente.
            </FormDescription>
          </div>
        ) : (
            <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Costo por kg (USD)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormDescription>
                    Ajusta el costo por kilogramo del material.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  )
}

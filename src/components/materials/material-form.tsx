
"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
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
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Settings } from "@/lib/types"
import { DEFAULT_SETTINGS } from "@/lib/defaults"

const MaterialSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  type: z.string().min(1, "Debes seleccionar un tipo."),
  cost: z.coerce.number().min(0, "El costo debe ser un número positivo."),
})

type MaterialFormValues = z.infer<typeof MaterialSchema>

interface MaterialFormProps {
  onSubmit: (data: MaterialFormValues) => void
  onCancel: () => void
  defaultValues?: Material | null
}

export function MaterialForm({ onSubmit, onCancel, defaultValues }: MaterialFormProps) {
  const [settings] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  const [selectedTypeDescription, setSelectedTypeDescription] = useState<string | undefined>("");

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(MaterialSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "",
      cost: defaultValues?.cost || 0,
    },
  })

  useEffect(() => {
    if (defaultValues?.type) {
      const initialType = FILAMENT_TYPES.find(t => t.value === defaultValues.type);
      setSelectedTypeDescription(initialType?.description);
    }
  }, [defaultValues]);

  const handleTypeChange = (value: string) => {
    const selectedType = FILAMENT_TYPES.find(t => t.value === value);
    setSelectedTypeDescription(selectedType?.description);
    form.setValue("type", value);
  }

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
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo por kg ({settings.currencyCode})</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
               <FormDescription>
                El precio que pagaste por un rollo de 1kg de este material.
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

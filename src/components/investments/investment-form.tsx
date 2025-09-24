
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const InvestmentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  amount: z.coerce.number().positive("El monto debe ser un número positivo."),
  createdAt: z.date({
    required_error: "La fecha es requerida.",
  }),
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
      createdAt: defaultValues?.createdAt ? new Date(defaultValues.createdAt) : new Date(),
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

        <FormField
            control={form.control}
            name="createdAt"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Fecha de la Inversión</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP", { locale: es })
                        ) : (
                            <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
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

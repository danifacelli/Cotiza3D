
"use client"

import type { CostBreakdown } from "@/lib/calculations"
import type { Settings } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

interface CostSummaryProps {
  breakdown: CostBreakdown | null
  settings: Settings
  actions?: React.ReactNode
}

const SummaryRow = ({ label, value, className = "" }: { label: string, value: string, className?: string }) => (
  <div className={`flex justify-between items-center text-sm ${className}`}>
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
)

export function CostSummary({ breakdown, settings, actions }: CostSummaryProps) {
  if (!breakdown) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Costos</CardTitle>
          <CardDescription>Completa los datos para ver el cálculo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Separator />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Costos</CardTitle>
        <CardDescription>Desglose del precio final.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SummaryRow
          label="Costo de Material"
          value={formatCurrency(breakdown.materialCost, "USD")}
        />
        <SummaryRow
          label="Depreciación Máquina"
          value={formatCurrency(breakdown.machineDepreciationCost, "USD")}
        />
        <SummaryRow
          label="Costo de Energía"
          value={formatCurrency(breakdown.machineEnergyCost, "USD")}
        />
        <SummaryRow
          label="Mano de Obra"
          value={formatCurrency(breakdown.laborCost, "USD")}
        />
        
        <Separator />
        
        <SummaryRow
          label="Subtotal Costos Fijos"
          value={formatCurrency(breakdown.subtotal, "USD")}
          className="font-semibold"
        />

        {breakdown.totalExtraCosts > 0 && (
            <SummaryRow
                label="Costos Adicionales"
                value={formatCurrency(breakdown.totalExtraCosts, "USD")}
            />
        )}
        
        <Separator />

        <SummaryRow
          label={`Ganancia (${settings.profitMargin}%)`}
          value={formatCurrency(breakdown.profitAmount, "USD")}
        />
        <SummaryRow
          label="Subtotal + Ganancia"
          value={formatCurrency(breakdown.subtotalWithProfit, "USD")}
          className="font-semibold"
        />
        <SummaryRow
          label={`IVA (${settings.iva}%)`}
          value={formatCurrency(breakdown.ivaAmount, "USD")}
        />
        
        <Separator />

        <div className="flex justify-between items-center text-xl font-bold">
          <span>Total</span>
          <span>{formatCurrency(breakdown.total, "USD", 'es-UY', true)}</span>
        </div>
      </CardContent>
      {actions && (
        <CardFooter className="flex flex-col gap-2">
            {actions}
        </CardFooter>
      )}
    </Card>
  )
}

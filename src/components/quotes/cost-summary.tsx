
"use client"

import type { CostBreakdown } from "@/lib/calculations"
import type { Settings, Machine, Quote } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CostSummaryProps {
  breakdown: CostBreakdown | null
  settings: Settings
  machine: Machine | undefined
  quoteInput: Partial<Quote>
  actions?: React.ReactNode
  logs?: string[]
}

const SummaryRow = ({ label, value, className = "", description }: { label: string, value: string, className?: string, description?: string }) => (
  <div className={`flex justify-between items-start text-sm ${className}`}>
    <div className="text-muted-foreground">
        <p>{label}</p>
        {description && <p className="text-xs text-muted-foreground/80">{description}</p>}
    </div>
    <span className="font-medium text-right">{value}</span>
  </div>
)

export function CostSummary({ breakdown, settings, machine, quoteInput, actions, logs }: CostSummaryProps) {
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
  
  const decimalPlaces = settings.currencyDecimalPlaces;

  const getEnergyCostDetails = () => {
    if (!machine || !quoteInput.printHours || !settings) return "";
    
    const totalPrintHours = quoteInput.printHours;
    const powerInKw = (machine.powerConsumption || 0) / 1000;
    const peakPrice = settings.peakEnergyCostKwh || 0;
    const offPeakPrice = settings.offPeakEnergyCostKwh || 0;

    let peakHours = 0;
    if (quoteInput.tariffType === 'peak') {
        peakHours = totalPrintHours;
    } else if (quoteInput.tariffType === 'mixed') {
        peakHours = Math.min(quoteInput.peakHours || 0, totalPrintHours);
    }
    const offPeakHours = totalPrintHours - peakHours;

    let details = [];
    if (peakHours > 0) {
        details.push(`${peakHours.toFixed(1)}h Punta a ${formatCurrency(peakPrice, "USD", 3)}`);
    }
    if (offPeakHours > 0) {
        details.push(`${offPeakHours.toFixed(1)}h Fuera de Punta a ${formatCurrency(offPeakPrice, "USD", 3)}`);
    }
    return `(${powerInKw.toFixed(2)}kW) ${details.join(' + ')}`;
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
          value={formatCurrency(breakdown.materialCost, "USD", decimalPlaces)}
        />
        <SummaryRow
          label="Costo de Energía"
          value={formatCurrency(breakdown.energyCost, "USD", decimalPlaces)}
          description={getEnergyCostDetails()}
        />
        <SummaryRow
          label="Depreciación Máquina"
          value={formatCurrency(breakdown.machineDepreciationCost, "USD", decimalPlaces)}
        />
        <SummaryRow
          label="Mano de Obra"
          value={formatCurrency(breakdown.laborCost, "USD", decimalPlaces)}
        />
        
        <Separator />
        
        <SummaryRow
          label="Subtotal Costos Fijos"
          value={formatCurrency(breakdown.subtotal, "USD", decimalPlaces)}
          className="font-semibold"
        />

        {breakdown.totalExtraCosts > 0 && (
            <SummaryRow
                label="Costos Adicionales"
                value={formatCurrency(breakdown.totalExtraCosts, "USD", decimalPlaces)}
            />
        )}
        
        <Separator />

        <SummaryRow
          label={`Ganancia (${settings.profitMargin}%)`}
          value={formatCurrency(breakdown.profitAmount, "USD", decimalPlaces)}
        />

        <div className="flex justify-between items-center text-xl font-bold pt-4">
          <span>Total</span>
          <span>{formatCurrency(breakdown.total, "USD", decimalPlaces)}</span>
        </div>
      </CardContent>
      {actions && (
        <CardFooter className="flex flex-col gap-2 pt-0">
            {actions}
        </CardFooter>
      )}
       {logs && logs.length > 0 && (
        <Accordion type="single" collapsible className="w-full px-6 pb-4">
          <AccordionItem value="logs">
            <AccordionTrigger className="text-xs text-muted-foreground">Mostrar Logs de Depuración</AccordionTrigger>
            <AccordionContent>
                <div className="mt-2 p-2 bg-muted/50 rounded-md max-h-48 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                        {logs.join('\n')}
                    </pre>
                </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </Card>
  )
}

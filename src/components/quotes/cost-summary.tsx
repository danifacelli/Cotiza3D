
"use client"

import type { CostBreakdown } from "@/lib/calculations"
import type { Settings, Machine, Quote } from "@/lib/types"
import { formatCurrency, cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { LATAM_CURRENCIES } from "@/lib/constants"
import { useMemo } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import type { UseFormReturn } from "react-hook-form"

interface CostSummaryProps {
  breakdown: CostBreakdown | null
  settings: Settings
  machine: Machine | undefined
  quoteInput: Partial<Quote>
  actions?: React.ReactNode
  exchangeRate?: number | null
  isExchangeRateLoading?: boolean
  form: UseFormReturn<any>
}

const SummaryRow = ({ label, value, className = "", description }: { label: string, value: React.ReactNode, className?: string, description?: string }) => (
  <div className={`flex justify-between items-start text-sm ${className}`}>
    <div className="text-muted-foreground">
        <p>{label}</p>
        {description && <p className="text-xs text-muted-foreground/80">{description}</p>}
    </div>
    <div className="font-medium text-right">{value}</div>
  </div>
)

export function CostSummary({ breakdown, settings, machine, quoteInput, actions, exchangeRate, isExchangeRateLoading, form }: CostSummaryProps) {
  
  const localCurrencyInfo = useMemo(() => {
    return LATAM_CURRENCIES.find(c => c.value === settings.localCurrency);
  }, [settings.localCurrency]);

  const { watch, setValue } = form;
  const finalPriceOverride = watch('finalPriceOverride');
  const isManualPrice = useMemo(() => typeof finalPriceOverride === 'number', [finalPriceOverride]);

  const handleManualPriceToggle = (checked: boolean) => {
    if (checked) {
        if (breakdown) {
             setValue('finalPriceOverride', parseFloat(breakdown.total.toFixed(settings.currencyDecimalPlaces)), { shouldDirty: true });
        }
    } else {
        setValue('finalPriceOverride', undefined, { shouldDirty: true });
    }
  }

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
  const highPrecisionDecimalPlaces = Math.max(4, decimalPlaces);

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

  const localCurrencyDecimalPlaces = localCurrencyInfo?.value === 'CLP' || localCurrencyInfo?.value === 'PYG' ? 0 : decimalPlaces;

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
          value={formatCurrency(breakdown.energyCost, "USD", highPrecisionDecimalPlaces)}
          description={getEnergyCostDetails()}
        />
        <SummaryRow
          label="Depreciación Máquina"
          value={formatCurrency(breakdown.machineDepreciationCost, "USD", highPrecisionDecimalPlaces)}
        />
        <SummaryRow
          label="Mano de Obra"
          value={formatCurrency(breakdown.laborCost, "USD", decimalPlaces)}
        />
        
        <Separator />
        
        <SummaryRow
          label="Subtotal Producción"
          value={formatCurrency(breakdown.subtotal, "USD", decimalPlaces)}
          className="font-semibold"
        />

        <Separator />

        {breakdown.designCost > 0 && (
            <SummaryRow
                label="Costo de Diseño"
                value={formatCurrency(breakdown.designCost, "USD", decimalPlaces)}
            />
        )}
        
        {breakdown.totalExtraCosts > 0 && (
            <SummaryRow
                label="Costos Adicionales"
                value={formatCurrency(breakdown.totalExtraCosts, "USD", decimalPlaces)}
            />
        )}

        <SummaryRow
          label="Subtotal General"
          value={
            <div className="flex flex-col">
              <span>{formatCurrency(breakdown.generalSubtotal, "USD", decimalPlaces)}</span>
              {exchangeRate && localCurrencyInfo && (
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(breakdown.generalSubtotal * exchangeRate, localCurrencyInfo.value, localCurrencyDecimalPlaces, 'symbol', localCurrencyInfo.locale)}
                </span>
              )}
            </div>
          }
          className="font-semibold"
        />
        
        <SummaryRow
          label={`Ganancia (${isManualPrice ? 'Ajustada' : `${settings.profitMargin}%`})`}
          value={formatCurrency(breakdown.profitAmount, "USD", decimalPlaces)}
        />

        <Separator />

        <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="manual-price-toggle"
                        checked={isManualPrice}
                        onCheckedChange={handleManualPriceToggle}
                    />
                    <Label htmlFor="manual-price-toggle" className={cn(isManualPrice && "text-primary")}>
                        Precio Manual
                    </Label>
                </div>
                {!isManualPrice && (
                    <div className="text-2xl font-bold text-right">
                        {formatCurrency(breakdown.total, "USD", decimalPlaces)}
                    </div>
                )}
            </div>
            
            {isManualPrice && (
                <FormField
                    control={form.control}
                    name="finalPriceOverride"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input 
                                type="number" 
                                step="0.01" 
                                className="text-2xl font-bold h-12 text-right"
                                {...field}
                                onFocus={(e) => e.target.select()}
                                onChange={e => field.onChange(e.target.value === '' ? 0 : e.target.valueAsNumber)}
                             />
                        </FormControl>
                    </FormItem>
                    )}
                />
            )}
        </div>


        <div className="pt-2 space-y-1 text-right">
            {isExchangeRateLoading && <p className="text-xs text-muted-foreground">Obteniendo cambio...</p>}
            {exchangeRate && localCurrencyInfo && (
                <>
                    <p className="text-xl font-bold">{formatCurrency(breakdown.total * exchangeRate, localCurrencyInfo.value, localCurrencyDecimalPlaces, 'symbol', localCurrencyInfo.locale)}</p>
                    <p className="text-xs text-muted-foreground">
                        Tasa de cambio: 1 USD ≈ {exchangeRate.toFixed(2)} {localCurrencyInfo.value}
                    </p>
                </>
            )}
            {exchangeRate === null && !isExchangeRateLoading && <p className="text-xs text-destructive">No se pudo obtener la tasa de cambio.</p>}
        </div>
      </CardContent>
      {actions && (
        <CardFooter className="flex flex-col gap-2 pt-0">
            {actions}
        </CardFooter>
      )}
    </Card>
  )
}

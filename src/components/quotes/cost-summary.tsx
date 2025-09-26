
"use client"

import type { CostBreakdown } from "@/lib/calculations"
import type { Settings, Machine, Quote } from "@/lib/types"
import { formatCurrency, cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { LATAM_CURRENCIES } from "@/lib/constants"
import { useMemo, useState, useEffect } from "react"
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

const SummaryRow = ({ label, value, localValue, className = "", description }: { label: string, value: React.ReactNode, localValue?: React.ReactNode, className?: string, description?: string }) => (
  <div className={`flex justify-between items-start text-sm ${className}`}>
    <div className="text-muted-foreground">
        <p>{label}</p>
        {description && <p className="text-xs text-muted-foreground/80">{description}</p>}
    </div>
    <div className="font-medium text-right">
        <div>{value}</div>
        {localValue && <div className="text-xs text-muted-foreground font-normal">{localValue}</div>}
    </div>
  </div>
)

export function CostSummary({ breakdown, settings, machine, quoteInput, actions, exchangeRate, isExchangeRateLoading, form }: CostSummaryProps) {
  
  const localCurrencyInfo = useMemo(() => {
    return LATAM_CURRENCIES.find(c => c.value === settings.localCurrency);
  }, [settings.localCurrency]);

  const { watch, setValue } = form;
  const finalPriceOverride = watch('finalPriceOverride');
  const isManualPrice = useMemo(() => typeof finalPriceOverride === 'number', [finalPriceOverride]);
  
  const localCurrencyDecimalPlaces = localCurrencyInfo?.value === 'CLP' || localCurrencyInfo?.value === 'PYG' ? 0 : settings.currencyDecimalPlaces;

  const handleManualPriceToggle = (checked: boolean) => {
    if (checked) {
        if (breakdown) {
             const priceToSet = parseFloat(breakdown.total.toFixed(settings.currencyDecimalPlaces));
             setValue('finalPriceOverride', priceToSet, { shouldDirty: true });
        }
    } else {
        setValue('finalPriceOverride', undefined, { shouldDirty: true });
    }
  }

  const handleUSDPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const usdValue = e.target.value === '' ? undefined : e.target.valueAsNumber;
    setValue('finalPriceOverride', usdValue, { shouldDirty: true });
  }

  const handleLocalPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const localValue = e.target.value === '' ? undefined : e.target.valueAsNumber;
      if (localValue === undefined) {
          setValue('finalPriceOverride', undefined, { shouldDirty: true });
          return;
      }

      if (exchangeRate && exchangeRate > 0) {
          setValue('finalPriceOverride', localValue / exchangeRate, { shouldDirty: true });
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
  
  const formatLocal = (amount: number) => {
    if (!exchangeRate || !localCurrencyInfo) return null;
    return formatCurrency(amount * exchangeRate, localCurrencyInfo.value, localCurrencyDecimalPlaces, 'symbol', localCurrencyInfo.locale);
  };

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
          localValue={formatLocal(breakdown.materialCost)}
        />
        <SummaryRow
          label="Costo de Energía"
          value={formatCurrency(breakdown.energyCost, "USD", highPrecisionDecimalPlaces)}
          localValue={formatLocal(breakdown.energyCost)}
          description={getEnergyCostDetails()}
        />
        <SummaryRow
          label="Depreciación Máquina"
          value={formatCurrency(breakdown.machineDepreciationCost, "USD", highPrecisionDecimalPlaces)}
          localValue={formatLocal(breakdown.machineDepreciationCost)}
        />
        <SummaryRow
          label="Mano de Obra"
          value={formatCurrency(breakdown.laborCost, "USD", decimalPlaces)}
          localValue={formatLocal(breakdown.laborCost)}
        />
        
        <Separator />
        
        <SummaryRow
          label="Subtotal Producción"
          value={formatCurrency(breakdown.subtotal, "USD", decimalPlaces)}
          localValue={formatLocal(breakdown.subtotal)}
          className="font-semibold"
        />

        <Separator />

        {breakdown.designCost > 0 && (
            <SummaryRow
                label="Costo de Diseño"
                value={formatCurrency(breakdown.designCost, "USD", decimalPlaces)}
                localValue={formatLocal(breakdown.designCost)}
            />
        )}
        
        {breakdown.totalExtraCosts > 0 && (
            <SummaryRow
                label="Costos Adicionales"
                value={formatCurrency(breakdown.totalExtraCosts, "USD", decimalPlaces)}
                localValue={formatLocal(breakdown.totalExtraCosts)}
            />
        )}
        
        <SummaryRow
          label="Subtotal de Costo"
          value={formatCurrency(breakdown.costSubtotal, "USD", decimalPlaces)}
          localValue={formatLocal(breakdown.costSubtotal)}
          className="font-semibold"
        />
        
        <SummaryRow
          label={`Ganancia (${isManualPrice ? 'Ajustada' : `${settings.profitMargin}%`})`}
          value={formatCurrency(breakdown.profitAmount, "USD", decimalPlaces)}
          localValue={formatLocal(breakdown.profitAmount)}
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
                         <div>{formatCurrency(breakdown.total, "USD", decimalPlaces)}</div>
                         {exchangeRate && localCurrencyInfo && (
                            <div className="text-lg font-semibold text-muted-foreground">{formatCurrency(breakdown.total * exchangeRate, localCurrencyInfo.value, localCurrencyDecimalPlaces, 'symbol', localCurrencyInfo.locale)}</div>
                         )}
                    </div>
                )}
            </div>
            
            {isManualPrice && (
                 <div className="space-y-4">
                     <FormField
                        control={form.control}
                        name="finalPriceOverride"
                        render={({ field }) => (
                        <FormItem>
                             <Label>Precio Total (USD)</Label>
                            <FormControl>
                                <Input 
                                    type="number" 
                                    step="0.01" 
                                    className="text-2xl font-bold h-12 text-right"
                                    {...field}
                                    value={finalPriceOverride ?? ""}
                                    onFocus={(e) => e.target.select()}
                                    onChange={handleUSDPriceChange}
                                />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                    {localCurrencyInfo && exchangeRate && (
                         <FormItem>
                            <Label>Precio Total ({localCurrencyInfo.value})</Label>
                            <FormControl>
                                <Input 
                                    type="number"
                                    step={localCurrencyDecimalPlaces === 0 ? "1" : "0.01"}
                                    className="text-2xl font-bold h-12 text-right"
                                    value={
                                        finalPriceOverride !== undefined && exchangeRate
                                        ? (finalPriceOverride * exchangeRate).toFixed(localCurrencyDecimalPlaces)
                                        : ""
                                    }
                                    onFocus={(e) => e.target.select()}
                                    onChange={handleLocalPriceChange}
                                />
                            </FormControl>
                         </FormItem>
                    )}
                 </div>
            )}
        </div>


        <div className="pt-2 space-y-1 text-right">
            {isExchangeRateLoading && <p className="text-xs text-muted-foreground">Obteniendo cambio...</p>}
            {exchangeRate && localCurrencyInfo && !isManualPrice && (
                <p className="text-xs text-muted-foreground">
                    Tasa de cambio: 1 USD ≈ {exchangeRate.toFixed(2)} {localCurrencyInfo.value}
                </p>
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

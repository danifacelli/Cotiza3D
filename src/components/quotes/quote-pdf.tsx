
"use client"

import type { CostBreakdown } from "@/lib/calculations"
import type { Settings, Machine, Quote } from "@/lib/types"
import { formatCurrency, cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Instagram, Mail, Globe, Phone } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LATAM_CURRENCIES } from "@/lib/constants"
import { useMemo } from "react"
import { Logo } from "@/components/icons/logo"

interface QuotePDFProps {
  quote: Quote
  parts: (Quote['parts'][0] & { name: string })[]
  settings: Settings
  machine: Machine | undefined
  breakdown: CostBreakdown
  exchangeRate: number | null
  isExchangeRateLoading: boolean
}

const PDFRow = ({ label, value, className = "", isTotal = false }: { label: string; value: string | React.ReactNode; className?: string; isTotal?: boolean }) => (
    <div className={cn("flex justify-between items-center py-2 px-4 text-sm", className, !isTotal && "border-b border-border")}>
        <p className={cn("text-muted-foreground", isTotal && "font-bold text-base text-foreground")}>{label}</p>
        <p className={cn("font-medium", isTotal && "font-bold text-base")}>{value}</p>
    </div>
)

export const QuotePDF = ({ quote, parts, settings, machine, breakdown, exchangeRate }: QuotePDFProps) => {

    const localCurrencyInfo = useMemo(() => {
        return LATAM_CURRENCIES.find(c => c.value === settings.localCurrency);
    }, [settings.localCurrency]);

    const totalGrams = useMemo(() => {
        return parts.reduce((acc, part) => acc + part.materialGrams, 0);
    }, [parts]);

    return (
        <div className="p-8 font-sans">
            {/* Header */}
            <header className="flex justify-between items-start pb-6 border-b-2 border-primary">
                <div className="flex items-center gap-4">
                    <Logo className="w-12 h-12 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">{settings.companyName || 'Presupuesto'}</h1>
                        <p className="text-muted-foreground">{settings.companyContact}</p>
                        {settings.companyInstagram && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Instagram className="w-4 h-4" />
                                <span>{settings.companyInstagram}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-semibold text-muted-foreground">Presupuesto</h2>
                    <p className="font-mono text-xs">ID: {quote.id}</p>
                    <p className="text-sm mt-1">Fecha: {format(new Date(quote.createdAt || new Date()), "d 'de' MMMM, yyyy", { locale: es })}</p>
                </div>
            </header>

            {/* Client Info */}
            <section className="grid grid-cols-2 gap-8 my-6">
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">CLIENTE</h3>
                    <p className="font-medium">{quote.clientName || 'Cliente sin especificar'}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">PROYECTO</h3>
                    <p className="font-medium">{quote.name}</p>
                </div>
            </section>

            {/* Details Table */}
            <section>
                 <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-4">DETALLES DEL PROYECTO</h3>
                 <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 bg-muted/50 font-semibold text-sm">
                        <div className="p-2 border-b">Descripción</div>
                        <div className="p-2 border-b text-right">Cantidad</div>
                        <div className="p-2 border-b text-right"></div>
                        <div className="p-2 border-b text-right"></div>
                    </div>
                    <div className="grid grid-cols-4 text-sm">
                        <div className="p-2 border-b">Dimensiones (Ancho x Alto x Largo)</div>
                        <div className="p-2 border-b text-right font-mono">{quote.width || 0} x {quote.height || 0} x {quote.depth || 0} mm</div>
                         <div className="p-2 border-b text-right"></div>
                        <div className="p-2 border-b text-right"></div>
                    </div>
                     <div className="grid grid-cols-4 text-sm">
                        <div className="p-2 border-b">Tiempo de Impresión</div>
                        <div className="p-2 border-b text-right font-mono">{quote.printHours.toFixed(2)} hs</div>
                         <div className="p-2 border-b text-right"></div>
                        <div className="p-2 border-b text-right"></div>
                    </div>
                    <div className="grid grid-cols-4 text-sm">
                        <div className="p-2 border-b">Material Utilizado</div>
                        <div className="p-2 border-b text-right font-mono">{totalGrams.toFixed(2)} g</div>
                        <div className="p-2 border-b text-right"></div>
                        <div className="p-2 border-b text-right"></div>
                    </div>
                    {parts.map(part => (
                         <div key={part.id} className="grid grid-cols-4 text-sm pl-6">
                            <div className="p-2 border-b text-muted-foreground">{part.name}</div>
                            <div className="p-2 border-b text-right font-mono">{part.materialGrams.toFixed(2)} g</div>
                             <div className="p-2 border-b text-right"></div>
                            <div className="p-2 border-b text-right"></div>
                        </div>
                    ))}
                 </div>
            </section>

            {/* Costs */}
            <section className="grid grid-cols-2 gap-8 my-6">
                <div className="space-y-4">
                     {quote.notes && (
                         <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">NOTAS ADICIONALES</h3>
                            <p className="text-sm p-3 border rounded-md bg-muted/30">{quote.notes}</p>
                         </div>
                     )}
                </div>
                <div className="border rounded-lg">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 pt-3 px-4">DESGLOSE DE COSTOS (USD)</h3>
                    <PDFRow label="Subtotal Producción" value={formatCurrency(breakdown.subtotal, 'USD', settings.currencyDecimalPlaces)} />
                    <PDFRow label={`Ganancia (${settings.profitMargin}%)`} value={formatCurrency(breakdown.profitAmount, 'USD', settings.currencyDecimalPlaces)} />
                    {breakdown.designCost > 0 && <PDFRow label="Costo de Diseño" value={formatCurrency(breakdown.designCost, 'USD', settings.currencyDecimalPlaces)} />}
                    {breakdown.totalExtraCosts > 0 && <PDFRow label="Costos Adicionales" value={formatCurrency(breakdown.totalExtraCosts, 'USD', settings.currencyDecimalPlaces)} />}
                    <PDFRow label="TOTAL (USD)" value={formatCurrency(breakdown.total, 'USD', settings.currencyDecimalPlaces)} isTotal={true} className="bg-muted/50" />
                    {exchangeRate && localCurrencyInfo && (
                        <div className="text-right px-4 pt-2">
                             <p className="text-lg font-bold">{formatCurrency(breakdown.total * exchangeRate, localCurrencyInfo.value, 0, 'symbol', localCurrencyInfo.locale)}</p>
                            <p className="text-xs text-muted-foreground">
                                1 USD ≈ {exchangeRate.toFixed(2)} {localCurrencyInfo.value}
                            </p>
                        </div>
                    )}
                </div>
            </section>

             {/* Footer */}
            <footer className="text-center text-xs text-muted-foreground pt-6 mt-6 border-t">
                <p>Presupuesto generado con Cotiza3D. Los valores son una estimación y pueden estar sujetos a cambios.</p>
                <p>Gracias por su confianza.</p>
            </footer>
        </div>
    )
}

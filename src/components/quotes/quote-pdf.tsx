
"use client"

import type { CostBreakdown } from "@/lib/calculations"
import type { Settings, Machine, Quote, Client } from "@/lib/types"
import { formatCurrency, cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Instagram, Mail, Globe, Phone, PackageCheck, FileText, CheckCircle, XCircle, ClipboardList } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LATAM_CURRENCIES } from "@/lib/constants"
import { useMemo } from "react"
import { Logo } from "@/components/icons/logo"

interface QuotePDFProps {
  quote: Quote
  client?: Client
  parts: (Quote['parts'][0] & { name: string })[]
  settings: Settings
  machine: Machine | undefined
  breakdown: CostBreakdown
  exchangeRate: number | null
  isExchangeRateLoading: boolean
}

const statusConfig = {
    draft: { label: 'Borrador', icon: FileText, className: "text-gray-600 bg-gray-100" },
    accepted: { label: 'Aceptado', icon: CheckCircle, className: "text-green-600 bg-green-100" },
    in_preparation: { label: 'En Preparación', icon: ClipboardList, className: "text-amber-600 bg-amber-100" },
    ready_to_deliver: { label: 'Listo para Entregar', icon: PackageCheck, className: "text-blue-600 bg-blue-100" },
    delivered: { label: 'Entregado', icon: PackageCheck, className: "text-violet-600 bg-violet-100" },
    canceled: { label: 'Cancelado', icon: XCircle, className: "text-red-600 bg-red-100" }
}

const PDFRow = ({ label, value, className = "", isTotal = false }: { label: string; value: string | React.ReactNode; className?: string; isTotal?: boolean }) => (
    <div className={cn("flex justify-between items-center py-2 px-4 text-sm", className, !isTotal && "border-b border-border")}>
        <p className={cn("text-muted-foreground", isTotal && "font-bold text-base text-foreground")}>{label}</p>
        <p className={cn("font-medium", isTotal && "font-bold text-base")}>{value}</p>
    </div>
)

export const QuotePDF = ({ quote, client, parts, settings, machine, breakdown, exchangeRate }: QuotePDFProps) => {

    const localCurrencyInfo = useMemo(() => {
        return LATAM_CURRENCIES.find(c => c.value === settings.localCurrency);
    }, [settings.localCurrency]);
    
    const localCurrencyDecimalPlaces = localCurrencyInfo?.value === 'CLP' || localCurrencyInfo?.value === 'PYG' ? 0 : settings.currencyDecimalPlaces;

    const currentStatus = statusConfig[quote.status] || statusConfig.draft;

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
                    <p className="text-sm mt-1">Fecha: {format(new Date(quote.createdAt || new Date()), "d 'de' MMMM, yyyy", { locale: es })}</p>
                    <div className={cn("mt-2 text-xs font-semibold inline-flex items-center gap-2 px-3 py-1 rounded-full", currentStatus.className)}>
                        <currentStatus.icon className="w-4 h-4" />
                        <span>{currentStatus.label}</span>
                    </div>
                </div>
            </header>

            {/* Client Info */}
            <section className="grid grid-cols-2 gap-8 my-6">
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">CLIENTE</h3>
                    <p className="font-medium">{client?.name || 'Cliente sin especificar'}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">PROYECTO</h3>
                    <p className="font-medium">{quote.name}</p>
                </div>
            </section>

            {/* Details Table */}
            <section>
                 <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">DETALLES DEL PROYECTO</h3>
                 <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 font-semibold">
                            <tr>
                                <th className="p-2 text-left w-2/3">Descripción</th>
                                <th className="p-2 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(quote.width || quote.height || quote.depth) ? (
                                <tr className="border-b">
                                    <td className="p-2">Dimensiones (Ancho x Alto x Largo)</td>
                                    <td className="p-2 text-right font-mono">{quote.width || 0} x {quote.height || 0} x {quote.depth || 0} mm</td>
                                </tr>
                            ) : null}
                             {quote.deliveryDate && (
                                <tr className="border-b">
                                    <td className="p-2">Fecha de Entrega Estimada</td>
                                    <td className="p-2 text-right font-mono">{format(new Date(quote.deliveryDate), "dd/MM/yyyy")}</td>
                                </tr>
                             )}
                        </tbody>
                    </table>
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
                    <PDFRow label="TOTAL (USD)" value={formatCurrency(breakdown.total, 'USD', settings.currencyDecimalPlaces)} isTotal={true} className="bg-muted/50" />
                    {exchangeRate && localCurrencyInfo && (
                        <div className="text-right px-4 py-4">
                             <p className="text-2xl font-bold">{formatCurrency(breakdown.total * exchangeRate, localCurrencyInfo.value, localCurrencyDecimalPlaces, 'symbol', localCurrencyInfo.locale)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Tasa de cambio (aprox): 1 USD ≈ {exchangeRate.toFixed(2)} {localCurrencyInfo.value}
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


"use client"

import type { CostBreakdown } from "@/lib/calculations"
import type { Settings, Machine, Design, Client } from "@/lib/types"
import { formatCurrency, cn } from "@/lib/utils"
import { Instagram } from 'lucide-react'
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LATAM_CURRENCIES } from "@/lib/constants"
import { useMemo } from "react"
import { Logo } from "@/components/icons/logo"
import Image from "next/image"

interface DesignPDFProps {
  design: Design
  settings: Settings
  machine: Machine | undefined
  breakdown: CostBreakdown
  exchangeRate: number | null
}

const PDFRow = ({ label, value, className = "", isTotal = false }: { label: string; value: string | React.ReactNode; className?: string; isTotal?: boolean }) => (
    <div className={cn("flex justify-between items-center py-2 px-4 text-sm", className, !isTotal && "border-b border-border")}>
        <p className={cn("text-muted-foreground", isTotal && "font-bold text-base text-foreground")}>{label}</p>
        <p className={cn("font-medium", isTotal && "font-bold text-base")}>{value}</p>
    </div>
)

export const DesignPDF = ({ design, settings, machine, breakdown, exchangeRate }: DesignPDFProps) => {

    const localCurrencyInfo = useMemo(() => {
        return LATAM_CURRENCIES.find(c => c.value === settings.localCurrency);
    }, [settings.localCurrency]);
    
    const localCurrencyDecimalPlaces = localCurrencyInfo?.value === 'CLP' || localCurrencyInfo?.value === 'PYG' ? 0 : settings.currencyDecimalPlaces;

    return (
        <div className="p-8 font-sans">
            {/* Header */}
            <header className="flex justify-between items-start pb-6 border-b-2 border-primary">
                <div className="flex items-center gap-4">
                    <Logo className="w-12 h-12 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">{settings.companyName || 'Costo de Diseño'}</h1>
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
                    <h2 className="text-xl font-semibold text-muted-foreground">Análisis de Costo</h2>
                    <p className="text-sm mt-1">Fecha: {format(new Date(design.createdAt || new Date()), "d 'de' MMMM, yyyy", { locale: es })}</p>
                </div>
            </header>

            {/* Client Info */}
            <section className="my-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">DISEÑO</h3>
                <p className="font-medium text-lg">{design.name}</p>
            </section>
            
            {/* Photos */}
            {(design.photo1_base64 || design.photo2_base64) && (
              <section className="my-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">IMÁGENES DE REFERENCIA</h3>
                <div className="grid grid-cols-2 gap-4">
                  {design.photo1_base64 && <div className="relative w-full h-48"><Image src={design.photo1_base64} alt="Foto 1" layout="fill" className="object-cover rounded-md border" /></div>}
                  {design.photo2_base64 && <div className="relative w-full h-48"><Image src={design.photo2_base64} alt="Foto 2" layout="fill" className="object-cover rounded-md border" /></div>}
                </div>
              </section>
            )}

            {/* Details Table */}
            <section>
                 <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">DETALLES DEL DISEÑO</h3>
                 <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 font-semibold">
                            <tr>
                                <th className="p-2 text-left w-2/3">Descripción</th>
                                <th className="p-2 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(design.width || design.height || design.depth) ? (
                                <tr className="border-b">
                                    <td className="p-2">Dimensiones (Ancho x Alto x Largo)</td>
                                    <td className="p-2 text-right font-mono">{design.width || 0} x {design.height || 0} x {design.depth || 0} mm</td>
                                </tr>
                            ) : null}
                             <tr className="border-b">
                                <td className="p-2">Tiempo de impresión estimado</td>
                                <td className="p-2 text-right font-mono">{design.printHours.toFixed(2)} horas</td>
                            </tr>
                        </tbody>
                    </table>
                 </div>
            </section>

            {/* Costs */}
            <section className="grid grid-cols-2 gap-8 my-6">
                <div className="space-y-4">
                     {design.notes && (
                         <div>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2">NOTAS ADICIONALES</h3>
                            <p className="text-sm p-3 border rounded-md bg-muted/30">{design.notes}</p>
                         </div>
                     )}
                </div>
                <div className="border rounded-lg">
                    <PDFRow label="PRECIO DE VENTA (USD)" value={formatCurrency(breakdown.total, 'USD', settings.currencyDecimalPlaces)} isTotal={true} className="bg-muted/50" />
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
                <p>Análisis de costo generado con Cotiza3D.</p>
            </footer>
        </div>
    )
}

    
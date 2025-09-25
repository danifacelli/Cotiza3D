
"use client"

import type { Client, Quote, Settings } from "@/lib/types"
import { formatCurrency, cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, XCircle, ClipboardList, PackageCheck } from "lucide-react"

interface ClientHistoryDialogProps {
    client: Client | null;
    quotes: (Quote & { totalUSD: number })[];
    settings: Settings;
    exchangeRate: number | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const statusConfig = {
    draft: { label: 'Borrador', icon: FileText, badgeClass: "bg-secondary text-secondary-foreground hover:bg-secondary/80" },
    accepted: { label: 'Aceptado', icon: CheckCircle, badgeClass: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30" },
    in_preparation: { label: 'En Preparación', icon: ClipboardList, badgeClass: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30" },
    ready_to_deliver: { label: 'Listo para Entregar', icon: PackageCheck, badgeClass: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30" },
    delivered: { label: 'Entregado', icon: PackageCheck, badgeClass: "bg-violet-500/20 text-violet-700 dark:text-violet-400 border-violet-500/30" },
    canceled: { label: 'Cancelado', icon: XCircle, badgeClass: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30" }
}

export function ClientHistoryDialog({ client, quotes, settings, exchangeRate, isOpen, onOpenChange }: ClientHistoryDialogProps) {
    if (!client) return null;

    const formatLocal = (amount: number) => {
        if (!exchangeRate || !settings?.localCurrency) return null;
        const decimalPlaces = settings.localCurrency === 'CLP' || settings.localCurrency === 'PYG' ? 0 : settings.currencyDecimalPlaces;
        return formatCurrency(amount * exchangeRate, settings.localCurrency, decimalPlaces, 'symbol');
    };
    
    const confirmedStatuses: Quote['status'][] = ['accepted', 'in_preparation', 'ready_to_deliver', 'delivered'];
    const totalBilled = quotes
        .filter(q => confirmedStatuses.includes(q.status))
        .reduce((sum, quote) => sum + quote.totalUSD, 0);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Historial de Presupuestos: {client.name}</DialogTitle>
                    <DialogDescription>
                        Una lista de todos los trabajos realizados para este cliente.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Monto (USD)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotes.length > 0 ? (
                                quotes.map(quote => {
                                    const currentStatus = statusConfig[quote.status] || statusConfig.draft;
                                    return (
                                        <TableRow key={quote.id}>
                                            <TableCell className="font-medium">{quote.name}</TableCell>
                                            <TableCell>
                                                 <Badge className={cn("cursor-pointer transition-colors", currentStatus.badgeClass)}>
                                                    <currentStatus.icon className="mr-2 h-4 w-4"/>
                                                    {currentStatus.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {formatCurrency(quote.totalUSD, 'USD', settings.currencyDecimalPlaces)}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        Este cliente no tiene presupuestos.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-end">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Facturado</p>
                        <p className="text-xl font-bold">{formatCurrency(totalBilled, 'USD', settings.currencyDecimalPlaces)}</p>
                        <p className="text-sm text-muted-foreground">{formatLocal(totalBilled)}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

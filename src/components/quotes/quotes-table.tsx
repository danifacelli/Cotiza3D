
"use client"

import { useRouter } from "next/navigation"
import type { Quote, Settings } from "@/lib/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatCurrency } from "@/lib/utils"

export type QuoteWithTotals = Quote & {
  totalUSD: number;
  totalLocal: number;
  costUSD: number;
};

interface QuotesTableProps {
  quotes: QuoteWithTotals[]
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onUpdateStatus: (id: string, status: Quote['status']) => void;
  settings: Settings | null;
  isHydrated: boolean
}

const statusConfig = {
    draft: { label: 'Borrador', icon: FileText, badgeClass: "bg-secondary text-secondary-foreground hover:bg-secondary/80" },
    accepted: { label: 'Aceptado', icon: CheckCircle, badgeClass: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30" },
    canceled: { label: 'Cancelado', icon: XCircle, badgeClass: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30" }
}

export function QuotesTable({ quotes, onDelete, onDuplicate, onUpdateStatus, settings, isHydrated }: QuotesTableProps) {
  const router = useRouter()

  if (!isHydrated) {
    return (
      <div className="space-y-2 rounded-md border p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  const decimalPlaces = settings?.currencyDecimalPlaces ?? 2;
  const localCurrencyCode = settings?.localCurrency ?? 'USD';

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Nombre</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Costo (USD)</TableHead>
            <TableHead className="text-right">Total (USD)</TableHead>
            <TableHead className="text-right">Total (Local)</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[120px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.length > 0 ? (
            quotes.map((quote) => {
              const currentStatus = statusConfig[quote.status] || statusConfig.draft;
              return (
              <TableRow key={quote.id} className="cursor-pointer" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>
                <TableCell className="font-medium">{quote.name}</TableCell>
                <TableCell>{quote.clientName || "-"}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Badge className={cn("cursor-pointer transition-colors", currentStatus.badgeClass)}>
                                <currentStatus.icon className="mr-2 h-4 w-4"/>
                                {currentStatus.label}
                            </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onUpdateStatus(quote.id, 'draft')}>
                                <FileText className="mr-2"/> Marcar como Borrador
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onUpdateStatus(quote.id, 'accepted')}>
                                <CheckCircle className="mr-2"/> Marcar como Aceptado
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => onUpdateStatus(quote.id, 'canceled')}>
                                <XCircle className="mr-2"/> Marcar como Cancelado
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(quote.costUSD, "USD", decimalPlaces)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(quote.totalUSD, "USD", decimalPlaces)}</TableCell>
                <TableCell className="text-right font-mono">
                    {formatCurrency(
                        quote.totalLocal, 
                        localCurrencyCode,
                        localCurrencyCode === 'CLP' || localCurrencyCode === 'PYG' ? 0 : decimalPlaces, 
                        'symbol'
                    )}
                </TableCell>
                <TableCell>
                  {format(new Date(quote.createdAt), "d MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro que deseas eliminar?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el presupuesto <strong>{quote.name}</strong>.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction asChild>
                              <Button variant="destructive" onClick={() => onDelete(quote.id)}>Sí, eliminar</Button>
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No hay presupuestos que coincidan con el filtro.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

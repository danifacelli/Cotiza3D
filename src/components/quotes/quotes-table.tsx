
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
import { MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle, FileText, Copy, Edit, Tag, ClipboardList, PackageCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatCurrency } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type QuoteWithTotals = Quote & {
  clientName?: string;
  totalUSD: number;
  totalLocal: number;
  costUSD: number;
  isManualPrice: boolean;
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
    in_preparation: { label: 'En Preparación', icon: ClipboardList, badgeClass: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30" },
    ready_to_deliver: { label: 'Listo para Entregar', icon: PackageCheck, badgeClass: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30" },
    delivered: { label: 'Entregado', icon: PackageCheck, badgeClass: "bg-violet-500/20 text-violet-700 dark:text-violet-400 border-violet-500/30" },
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
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Cant.</TableHead>
              <TableHead className="text-right">Costo Unidad</TableHead>
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
                <TableRow key={quote.id}>
                  <TableCell className="cursor-pointer" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>{quote.clientName || "-"}</TableCell>
                  <TableCell className="font-medium cursor-pointer" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>{quote.name}</TableCell>
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
                              <DropdownMenuItem onClick={() => onUpdateStatus(quote.id, 'in_preparation')}>
                                  <ClipboardList className="mr-2"/> Marcar como En Preparación
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onUpdateStatus(quote.id, 'ready_to_deliver')}>
                                  <PackageCheck className="mr-2"/> Marcar como Listo para Entregar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onUpdateStatus(quote.id, 'delivered')}>
                                  <PackageCheck className="mr-2"/> Marcar como Entregado
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onUpdateStatus(quote.id, 'canceled')}>
                                  <XCircle className="mr-2"/> Marcar como Cancelado
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>{quote.quantity}</TableCell>
                  <TableCell className="text-right font-mono cursor-pointer" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <span>{formatCurrency(quote.costUSD, "USD", decimalPlaces)}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>{formatCurrency(quote.costUSD, localCurrencyCode, localCurrencyCode === 'CLP' || localCurrencyCode === 'PYG' ? 0 : decimalPlaces, 'symbol')}</p>
                        </TooltipContent>
                      </Tooltip>
                  </TableCell>
                  <TableCell className="text-right font-mono cursor-pointer" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-end gap-2">
                              {quote.isManualPrice && <Tag className="h-3 w-3 text-muted-foreground" title="Precio manual"/>}
                              {formatCurrency(quote.totalUSD, "USD", decimalPlaces)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatCurrency(quote.totalLocal, localCurrencyCode, localCurrencyCode === 'CLP' || localCurrencyCode === 'PYG' ? 0 : decimalPlaces, 'symbol')}</p>
                        </TooltipContent>
                      </Tooltip>
                  </TableCell>
                  <TableCell className="text-right font-mono cursor-pointer" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>
                     <Tooltip>
                        <TooltipTrigger asChild>
                           <span>
                              {formatCurrency(
                                  quote.totalLocal, 
                                  localCurrencyCode,
                                  localCurrencyCode === 'CLP' || localCurrencyCode === 'PYG' ? 0 : decimalPlaces, 
                                  'symbol'
                              )}
                           </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatCurrency(quote.totalUSD, "USD", decimalPlaces)}</p>
                        </TooltipContent>
                      </Tooltip>
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>
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
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Duplicar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro que deseas duplicar?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Se creará una copia del presupuesto <strong>{quote.name}</strong> en estado "Borrador".
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <Button onClick={() => onDuplicate(quote.id)}>Sí, duplicar</Button>
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
                <TableCell colSpan={9} className="h-24 text-center">
                  No hay presupuestos que coincidan con el filtro.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}

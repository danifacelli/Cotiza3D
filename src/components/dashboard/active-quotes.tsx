
"use client"

import { useRouter } from "next/navigation"
import type { Quote, Client } from "@/lib/types"
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FileText, CheckCircle, XCircle, ClipboardList, PackageCheck, MoreVertical } from "lucide-react"

interface ActiveQuotesProps {
  quotes: Quote[]
  clients: Client[]
  onUpdateStatus: (id: string, status: Quote['status']) => void;
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

export function ActiveQuotes({ quotes, clients, onUpdateStatus, isHydrated }: ActiveQuotesProps) {
  const router = useRouter()
  
  const getClientName = (clientId?: string) => {
    if (!clientId) return "N/A";
    return clients.find(c => c.id === clientId)?.name || "Cliente no encontrado";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trabajos Activos</CardTitle>
        <CardDescription>Presupuestos aceptados, en preparación o listos para entregar.</CardDescription>
      </CardHeader>
      <CardContent>
        {isHydrated ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Trabajo</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.length > 0 ? (
                    quotes.map((quote) => {
                      const currentStatus = statusConfig[quote.status] || statusConfig.draft;
                      return (
                      <TableRow key={quote.id} className="cursor-pointer" onClick={() => router.push(`/quotes/${quote.id}/edit`)}>
                        <TableCell>{getClientName(quote.clientId)}</TableCell>
                        <TableCell className="font-medium">{quote.name}</TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Badge className={cn("cursor-pointer transition-colors", currentStatus.badgeClass)}>
                                        <currentStatus.icon className="mr-2 h-4 w-4"/>
                                        {currentStatus.label}
                                    </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
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
                      </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No hay trabajos activos en este momento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
        ) : (
             <div className="space-y-2 rounded-md border p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )}
      </CardContent>
    </Card>
  )
}

    
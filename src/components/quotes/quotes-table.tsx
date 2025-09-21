
"use client"

import { useRouter } from "next/navigation"
import type { Quote } from "@/lib/types"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

interface QuotesTableProps {
  quotes: Quote[]
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  isHydrated: boolean
}

export function QuotesTable({ quotes, onDelete, onDuplicate, isHydrated }: QuotesTableProps) {
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <TableRow key={quote.id} onClick={() => router.push(`/quotes/${quote.id}/edit`)} className="cursor-pointer">
                <TableCell className="font-medium">{quote.name}</TableCell>
                <TableCell>{quote.clientName || "-"}</TableCell>
                <TableCell>
                  <Badge variant={quote.status === 'draft' ? 'secondary' : 'default'}>
                    {quote.status === 'draft' ? 'Borrador' : 'Finalizado'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(quote.createdAt), "d MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/quotes/${quote.id}/edit`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => onDuplicate(quote.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(quote.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No hay presupuestos. Comienza creando uno.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

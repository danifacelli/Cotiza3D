
"use client"

import type { Client, Settings } from "@/lib/types"
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
import { Pencil, Trash2, Instagram, Facebook, Phone, History } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { DEFAULT_SETTINGS } from "@/lib/defaults"

export type ClientWithStats = Client & {
    lastJobName?: string;
    totalPurchased: number;
}

interface ClientsTableProps {
  clients: ClientWithStats[]
  onEdit: (client: Client) => void
  onDelete: (id: string) => void
  onViewHistory: (client: Client) => void
  isHydrated: boolean
  settings: Settings | null
  exchangeRate: number | null
}

export function ClientsTable({ clients, onEdit, onDelete, onViewHistory, isHydrated, settings, exchangeRate }: ClientsTableProps) {
  
  if (!isHydrated) {
    return (
      <div className="space-y-2 rounded-md border p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  const formatLocal = (amount: number) => {
    if (!exchangeRate || !settings?.localCurrency) return null;
    const decimalPlaces = settings.localCurrency === 'CLP' || settings.localCurrency === 'PYG' ? 0 : settings.currencyDecimalPlaces;
    return formatCurrency(amount * exchangeRate, settings.localCurrency, decimalPlaces, 'symbol');
  };

  const sortedClients = [...clients].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Último Trabajo</TableHead>
            <TableHead className="text-right">Total Comprado</TableHead>
            <TableHead>Fecha de Registro</TableHead>
            <TableHead className="w-[160px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClients.length > 0 ? (
            sortedClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-2">
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    )}
                    {client.instagram && (
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-muted-foreground" />
                        <Link href={`https://instagram.com/${client.instagram.replace('@', '')}`} target="_blank" className="text-sm hover:underline">
                          {client.instagram}
                        </Link>
                      </div>
                    )}
                     {client.facebook && (
                      <div className="flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-muted-foreground" />
                         <Link href={`https://facebook.com/${client.facebook}`} target="_blank" className="text-sm hover:underline">
                          {client.facebook}
                        </Link>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{client.lastJobName || 'N/A'}</TableCell>
                 <TableCell className="text-right font-mono">
                    <div>{formatCurrency(client.totalPurchased, 'USD', settings?.currencyDecimalPlaces ?? 2)}</div>
                    <div className="text-xs text-muted-foreground">{formatLocal(client.totalPurchased)}</div>
                </TableCell>
                <TableCell>
                  {format(new Date(client.createdAt), "d MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewHistory(client)}>
                        <History className="h-4 w-4" />
                        <span className="sr-only">Ver Historial</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(client)}>
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente <strong>{client.name}</strong> y lo desvinculará de los presupuestos existentes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button variant="destructive" onClick={() => onDelete(client.id)}>Sí, eliminar</Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No tienes clientes registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

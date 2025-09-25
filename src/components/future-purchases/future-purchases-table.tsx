
"use client"

import type { FuturePurchase, Settings } from "@/lib/types"
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
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Pencil, Trash2, Link as LinkIcon, ShoppingCart, Copy } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, cn } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface FuturePurchasesTableProps {
  purchases: FuturePurchase[]
  onEdit: (purchase: FuturePurchase) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMarkAsPurchased: (purchase: FuturePurchase) => void
  isHydrated: boolean
  settings: Settings | null
  exchangeRate: number | null
}

export function FuturePurchasesTable({ purchases, onEdit, onDelete, onDuplicate, onMarkAsPurchased, isHydrated, settings, exchangeRate }: FuturePurchasesTableProps) {
  
  if (!isHydrated) {
    return (
      <div className="rounded-md border p-4 space-y-2">
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
  
  const sortedPurchases = [...purchases].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Artículo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="w-[180px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPurchases.length > 0 ? (
            sortedPurchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium align-top">
                    <div className="font-semibold">{purchase.name}</div>
                    {purchase.description && (
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap max-w-md">{purchase.description}</p>
                    )}
                    {purchase.link && (
                        <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1 text-xs">
                            <Link href={purchase.link} target="_blank" rel="noopener noreferrer">
                                <LinkIcon className="mr-1" />
                                Ver producto
                            </Link>
                        </Button>
                    )}
                </TableCell>
                <TableCell className="align-top">
                    <Badge variant={purchase.status === 'purchased' ? 'default' : 'secondary'}>
                        {purchase.status === 'purchased' ? 'Comprado' : 'Pendiente'}
                    </Badge>
                </TableCell>
                <TableCell className="text-right font-mono align-top">
                    <div>{formatCurrency(purchase.priceUSD, 'USD', settings?.currencyDecimalPlaces ?? 2)}</div>
                    <div className="text-xs text-muted-foreground">{formatLocal(purchase.priceUSD)}</div>
                </TableCell>
                <TableCell className="align-top text-right">
                  <div className="flex justify-end gap-1">
                    {purchase.status === 'pending' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMarkAsPurchased(purchase)}>
                            <ShoppingCart className="h-4 w-4" />
                            <span className="sr-only">Marcar como comprado</span>
                        </Button>
                    )}
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(purchase)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDuplicate(purchase.id)}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Duplicar</span>
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el artículo <strong>{purchase.name}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button variant="destructive" onClick={() => onDelete(purchase.id)}>Sí, eliminar</Button>
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
              <TableCell colSpan={4} className="h-24 text-center">
                No tienes compras futuras en tu lista.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

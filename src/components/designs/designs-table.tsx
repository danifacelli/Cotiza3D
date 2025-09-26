
"use client"

import { useRouter } from "next/navigation"
import type { Design, Settings } from "@/lib/types"
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
import { Pencil, Trash2, Copy, Tag, Image as ImageIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatCurrency } from "@/lib/utils"

export type DesignWithTotals = Design & {
  totalUSD: number;
  totalLocal: number;
  costUSD: number;
  isManualPrice: boolean;
};

interface DesignsTableProps {
  designs: DesignWithTotals[]
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  settings: Settings | null;
  isHydrated: boolean
}

export function DesignsTable({ designs, onDelete, onDuplicate, settings, isHydrated }: DesignsTableProps) {
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
            <TableHead>Imágenes</TableHead>
            <TableHead className="text-right">Costo (USD)</TableHead>
            <TableHead className="text-right">Total (USD)</TableHead>
            <TableHead className="text-right">Total (Local)</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[120px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {designs.length > 0 ? (
            designs.map((design) => {
              return (
              <TableRow key={design.id} className="cursor-pointer" onClick={() => router.push(`/designs/${design.id}/edit`)}>
                <TableCell className="font-medium">{design.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(design.photo1_base64 || design.photo2_base64) ? (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(design.costUSD, "USD", decimalPlaces)}</TableCell>
                <TableCell className="text-right font-mono">
                    <div className="flex items-center justify-end gap-2">
                         {design.isManualPrice && <Tag className="h-3 w-3 text-muted-foreground" title="Precio manual"/>}
                         {formatCurrency(design.totalUSD, "USD", decimalPlaces)}
                    </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                    {formatCurrency(
                        design.totalLocal, 
                        localCurrencyCode,
                        localCurrencyCode === 'CLP' || localCurrencyCode === 'PYG' ? 0 : decimalPlaces, 
                        'symbol'
                    )}
                </TableCell>
                <TableCell>
                  {format(new Date(design.createdAt), "d MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); router.push(`/designs/${design.id}/edit`); }}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Duplicar</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro que deseas duplicar?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Se creará una copia del diseño <strong>{design.name}</strong>.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction asChild>
                              <Button onClick={(e) => { e.stopPropagation(); onDuplicate(design.id); }}>Sí, duplicar</Button>
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro que deseas eliminar?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el diseño <strong>{design.name}</strong>.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction asChild>
                              <Button variant="destructive" onClick={(e) => { e.stopPropagation(); onDelete(design.id); }}>Sí, eliminar</Button>
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
              <TableCell colSpan={7} className="h-24 text-center">
                No has creado ningún diseño.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

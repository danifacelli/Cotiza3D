
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Copy, Tag, ClipboardList, Link2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Image from 'next/image'

export type DesignWithTotals = Design & {
  totalUSD: number;
  totalLocal: number;
  costUSD: number;
  costLocal: number;
  isManualPrice: boolean;
};

interface DesignsTableProps {
  designs: DesignWithTotals[]
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onConvertToQuote: (id: string) => void
  settings: Settings | null;
  isHydrated: boolean
}

export function DesignsTable({ designs, onDelete, onDuplicate, onConvertToQuote, settings, isHydrated }: DesignsTableProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleCopyLink = (link: string, linkName: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: "¡Enlace copiado!",
      description: `El enlace de ${linkName} se ha copiado a tu portapapeles.`,
    })
  }

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
            <TableHead className="w-[50px]">Imagen</TableHead>
            <TableHead className="w-[30%]">Nombre</TableHead>
            <TableHead className="text-right">Costo</TableHead>
            <TableHead className="text-right">Total (USD)</TableHead>
            <TableHead className="text-right">Total ({localCurrencyCode})</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[200px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {designs.length > 0 ? (
            designs.map((design) => {
              return (
              <TableRow key={design.id} className="cursor-pointer" onClick={() => router.push(`/designs/${design.id}/edit`)}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {design.photo1_base64 ? (
                      <div className="w-10 h-10 rounded-md overflow-hidden relative">
                         <Image src={design.photo1_base64} alt={design.name} layout="fill" className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-xs">N/A</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{design.name}</TableCell>
                <TableCell className="text-right font-mono">
                    <div>{formatCurrency(design.costUSD, "USD", decimalPlaces)}</div>
                    <div className="text-xs text-muted-foreground">
                        {formatCurrency(
                            design.costLocal, 
                            localCurrencyCode,
                            localCurrencyCode === 'CLP' || localCurrencyCode === 'PYG' ? 0 : decimalPlaces, 
                            'symbol'
                        )}
                    </div>
                </TableCell>
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
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Copiar enlaces">
                          <Link2 className="h-4 w-4" />
                          <span className="sr-only">Copiar enlaces</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={!design.mercadoLibreLink}
                          onClick={() => handleCopyLink(design.mercadoLibreLink!, 'Mercado Libre')}
                        >
                          Copiar link de Mercado Libre
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={!design.instagramLink}
                          onClick={() => handleCopyLink(design.instagramLink!, 'Instagram')}
                        >
                          Copiar link de Instagram
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={!design.link}
                          onClick={() => handleCopyLink(design.link!, 'Otro Link')}
                        >
                          Copiar otro link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Generar Presupuesto" onClick={(e) => e.stopPropagation()}>
                            <ClipboardList className="h-4 w-4" />
                            <span className="sr-only">Generar Presupuesto</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>¿Generar un presupuesto a partir de este diseño?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Se creará un nuevo presupuesto en estado "Borrador" con los datos de <strong>{design.name}</strong> y serás redirigido para editarlo.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction asChild>
                              <Button onClick={(e) => { e.stopPropagation(); onConvertToQuote(design.id); }}>Sí, generar</Button>
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Editar" onClick={(e) => { e.stopPropagation(); router.push(`/designs/${design.id}/edit`); }}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8" title="Duplicar" onClick={(e) => e.stopPropagation()}>
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
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Eliminar" onClick={(e) => e.stopPropagation()}>
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

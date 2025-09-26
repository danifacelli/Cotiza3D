
"use client"

import type { LinkItem } from "@/lib/types"
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
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Link as LinkIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface LinksTableProps {
  links: LinkItem[]
  onEdit: (link: LinkItem) => void
  onDelete: (id: string) => void
  isHydrated: boolean
}

export function LinksTable({ links, onEdit, onDelete, isHydrated }: LinksTableProps) {
  
  if (!isHydrated) {
    return (
      <div className="rounded-md border p-4 space-y-2">
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
            <TableHead>Descripción</TableHead>
            <TableHead className="w-[120px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.length > 0 ? (
            links.map((linkItem) => (
              <TableRow key={linkItem.id}>
                <TableCell className="font-medium align-top">
                    <div className="font-semibold">{linkItem.name}</div>
                    <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1 text-xs">
                        <Link href={linkItem.link} target="_blank" rel="noopener noreferrer">
                            <LinkIcon className="mr-1" />
                            {linkItem.link}
                        </Link>
                    </Button>
                    {linkItem.description && (
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap max-w-md">{linkItem.description}</p>
                    )}
                </TableCell>
                <TableCell className="align-top text-right">
                  <div className="flex justify-end gap-1">
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(linkItem)}>
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el enlace <strong>{linkItem.name}</strong>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button variant="destructive" onClick={() => onDelete(linkItem.id)}>Sí, eliminar</Button>
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
              <TableCell colSpan={2} className="h-24 text-center">
                No has guardado ningún enlace.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}


"use client"

import type { Material } from "@/lib/types"
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
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Pencil, Trash2, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { DEFAULT_SETTINGS } from "@/lib/defaults"
import type { Settings } from "@/lib/types"

interface MaterialsGridProps {
  materials: (Material & { description?: string })[]
  onEdit: (material: Material) => void
  onDelete: (id: string) => void
  isHydrated: boolean
}

function MaterialCardActions({ material, onEdit, onDelete }: { material: Material, onEdit: () => void; onDelete: () => void }) {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Más acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro que deseas eliminar?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el material <strong>{material.name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onDelete}>Sí, eliminar</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function MaterialsGrid({ materials, onEdit, onDelete, isHydrated }: MaterialsGridProps) {
  const [settings] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  if (!isHydrated) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-1/3" />
                </CardContent>
            </Card>
        ))}
      </div>
    )
  }

  if (materials.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed text-center h-96">
            <h2 className="text-xl font-semibold">No tienes materiales</h2>
            <p className="text-muted-foreground mt-2">Comienza agregando tu primer filamento.</p>
        </div>
    )
  }


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {materials.map((material) => (
        <Card key={material.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{material.name}</CardTitle>
              <Badge variant="secondary" className="mt-2 font-mono">{material.type}</Badge>
            </div>
            <MaterialCardActions
                material={material}
                onEdit={() => onEdit(material)}
                onDelete={() => onDelete(material.id)}
            />
          </CardHeader>
          <CardContent className="flex flex-col flex-grow justify-between">
            <p className="text-sm text-muted-foreground mb-4">
              {material.description}
            </p>
             <div className="flex items-center text-lg font-semibold">
                <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                {formatCurrency(material.cost, 'USD', settings.currencyDecimalPlaces)}
                <span className="text-xs text-muted-foreground font-normal ml-1"> / kg</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

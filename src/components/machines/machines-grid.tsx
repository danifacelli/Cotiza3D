
"use client"

import type { Machine } from "@/lib/types"
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Pencil, Trash2, Zap, DollarSign } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { DEFAULT_SETTINGS } from "@/lib/defaults"
import type { Settings } from "@/lib/types"

interface MachinesGridProps {
  machines: Machine[]
  onEdit: (machine: Machine) => void
  onDelete: (id: string) => void
  isHydrated: boolean
}

function MachineCardActions({ machine, onEdit, onDelete }: { machine: Machine, onEdit: () => void; onDelete: () => void }) {
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
                Esta acción no se puede deshacer. Esto eliminará permanentemente la máquina <strong>{machine.name}</strong>.
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

export function MachinesGrid({ machines, onEdit, onDelete, isHydrated }: MachinesGridProps) {
  const [settings] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  if (!isHydrated) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
        ))}
      </div>
    )
  }

  if (machines.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed text-center h-96">
            <h2 className="text-xl font-semibold">No tienes máquinas</h2>
            <p className="text-muted-foreground mt-2">Comienza agregando tu primera impresora.</p>
        </div>
    )
  }


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {machines.map((machine) => (
        <Card key={machine.id} className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{machine.name}</CardTitle>
            </div>
            <MachineCardActions
                machine={machine}
                onEdit={() => onEdit(machine)}
                onDelete={() => onDelete(machine.id)}
            />
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
             <div className="flex items-center text-sm">
                <DollarSign className="w-4 h-4 mr-3 text-muted-foreground" />
                <span className="font-semibold mr-2">Depreciación:</span>
                <span>{formatCurrency(machine.costPerHour, 'USD', settings.currencyDecimalPlaces)} / hora</span>
            </div>
            <div className="flex items-center text-sm">
                <Zap className="w-4 h-4 mr-3 text-muted-foreground flex-shrink-0" />
                 <span className="font-semibold mr-2">Consumo:</span>
                 <span>{machine.powerConsumption} W</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


"use client"

import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { DEFAULT_MACHINES, generateId } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import type { Machine } from "@/lib/types"
import { MachineForm } from "@/components/machines/machine-form"
import { MachinesGrid } from "@/components/machines/machines-grid"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { useToast } from "@/hooks/use-toast"

export default function MachinesPage() {
  const [machines, setMachines, isHydrated] = useLocalStorage<Machine[]>(
    LOCAL_STORAGE_KEYS.MACHINES,
    DEFAULT_MACHINES
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const { toast } = useToast()

  const handleNewMachine = () => {
    setSelectedMachine(null)
    setIsFormOpen(true)
  }

  const handleEditMachine = (machine: Machine) => {
    setSelectedMachine(machine)
    setIsFormOpen(true)
  }

  const handleDeleteMachine = (id: string) => {
    setMachines(machines.filter((m) => m.id !== id))
    toast({
      title: "Máquina eliminada",
      description: "La máquina ha sido eliminada correctamente.",
    })
  }

  const handleSaveMachine = (data: Omit<Machine, 'id'>) => {
    if (selectedMachine) {
      // Editing
      setMachines(
        machines.map((m) =>
          m.id === selectedMachine.id ? { ...m, ...data } : m
        )
      )
      toast({
        title: "Máquina actualizada",
        description: "Los cambios han sido guardados.",
      })
    } else {
      // Creating
      setMachines([...machines, { id: generateId(), ...data }])
       toast({
        title: "Máquina creada",
        description: "La nueva máquina ha sido agregada.",
      })
    }
    setIsFormOpen(false)
    setSelectedMachine(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Máquinas</h1>
            <p className="text-muted-foreground">Administra tus impresoras 3D.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleNewMachine}>
                <PlusCircle className="mr-2" />
                Nueva Máquina
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>{selectedMachine ? "Editar Máquina" : "Nueva Máquina"}</DialogTitle>
                <DialogDescription>
                    {selectedMachine ? "Modifica los detalles de tu impresora." : "Añade una nueva impresora a tu taller."}
                </DialogDescription>
                </DialogHeader>
                <MachineForm
                onSubmit={handleSaveMachine}
                defaultValues={selectedMachine}
                onCancel={() => setIsFormOpen(false)}
                />
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <MachinesGrid
        machines={machines}
        onEdit={handleEditMachine}
        onDelete={handleDeleteMachine}
        isHydrated={isHydrated}
      />
    </div>
  )
}

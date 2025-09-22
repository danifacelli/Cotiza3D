
"use client"

import { useState, useRef } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { DEFAULT_MACHINES, generateId } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, Upload, Download } from "lucide-react"
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImportData, setPendingImportData] = useState<Machine[] | null>(null)
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false)

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
  
  const handleDeleteAllMachines = () => {
    setMachines([])
    toast({
      title: "Todas las máquinas han sido eliminadas",
      description: "Tu lista de máquinas está ahora vacía.",
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

  const handleExportMachines = () => {
    try {
      const dataStr = JSON.stringify(machines, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cotiza3d_maquinas.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Exportación exitosa",
        description: "Tus máquinas han sido exportadas a `cotiza3d_maquinas.json`.",
      });
    } catch (error) {
      console.error("Error exporting machines:", error);
      toast({
        title: "Error de exportación",
        description: "No se pudieron exportar las máquinas.",
        variant: "destructive",
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") {
          throw new Error("El archivo no es válido.");
        }
        const importedData = JSON.parse(text);

        // Basic validation
        if (!Array.isArray(importedData) || importedData.some(item => !item.id || !item.name)) {
            throw new Error("El archivo JSON no tiene el formato esperado para las máquinas.");
        }

        setPendingImportData(importedData);
        setIsImportConfirmOpen(true);

      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido.";
        toast({
          title: "Error de importación",
          description: `No se pudo leer el archivo. ${message}`,
          variant: "destructive",
        });
      } finally {
        // Reset file input to allow re-importing the same file
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (pendingImportData) {
      setMachines(pendingImportData);
      toast({
        title: "Importación exitosa",
        description: "Tus máquinas han sido reemplazadas con los datos del archivo.",
      });
    }
    setPendingImportData(null);
    setIsImportConfirmOpen(false);
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Máquinas</h1>
            <p className="text-muted-foreground">Administra tus impresoras 3D.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            {isHydrated && machines.length > 0 && (
                 <Button variant="outline" onClick={handleExportMachines}>
                    <Download className="mr-2" />
                    Exportar
                </Button>
            )}
            
            <Button variant="outline" onClick={handleImportClick}>
                <Upload className="mr-2" />
                Importar
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="application/json"
            />
            
            {isHydrated && machines.length > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive-outline">
                            <Trash2 className="mr-2" />
                            Eliminar Todo
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente todas
                            tus máquinas.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllMachines} asChild>
                            <Button variant="destructive">Sí, eliminar todo</Button>
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
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

             <AlertDialog open={isImportConfirmOpen} onOpenChange={setIsImportConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Importación</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro de que deseas reemplazar todas tus máquinas actuales con los datos del archivo importado? Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setPendingImportData(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmImport} asChild>
                        <Button>Sí, importar</Button>
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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

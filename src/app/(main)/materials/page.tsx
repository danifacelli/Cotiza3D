
"use client"

import { useState, useRef } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS, FILAMENT_TYPES } from "@/lib/constants"
import { DEFAULT_MATERIALS } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PlusCircle, Trash2, Upload, Download } from "lucide-react"
import type { Material } from "@/lib/types"
import { MaterialForm } from "@/components/materials/material-form"
import { MaterialsGrid } from "@/components/materials/materials-grid"
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
import { generateId } from "@/lib/defaults"

export default function MaterialsPage() {
  const [materials, setMaterials, isHydrated] = useLocalStorage<Material[]>(
    LOCAL_STORAGE_KEYS.MATERIALS,
    DEFAULT_MATERIALS
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImportData, setPendingImportData] = useState<Material[] | null>(null)
  const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false)

  const handleNewMaterial = () => {
    setSelectedMaterial(null)
    setIsFormOpen(true)
  }

  const handleEditMaterial = (material: Material) => {
    setSelectedMaterial(material)
    setIsFormOpen(true)
  }

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id))
    toast({
      title: "Material eliminado",
      description: "El material ha sido eliminado correctamente.",
    })
  }
  
  const handleDeleteAllMaterials = () => {
    setMaterials([])
    toast({
      title: "Todos los materiales han sido eliminados",
      description: "Tu lista de insumos está ahora vacía.",
    })
  }

  const handleSaveMaterial = (data: Omit<Material, 'id'>) => {
    if (selectedMaterial) {
      // Editing
      setMaterials(
        materials.map((m) =>
          m.id === selectedMaterial.id ? { ...m, ...data } : m
        )
      )
      toast({
        title: "Material actualizado",
        description: "Los cambios han sido guardados.",
      })
    } else {
      // Creating
      setMaterials([...materials, { id: generateId(), ...data }])
       toast({
        title: "Material creado",
        description: "El nuevo material ha sido agregado.",
      })
    }
    setIsFormOpen(false)
    setSelectedMaterial(null)
  }

  const handleExportMaterials = () => {
    try {
      const dataStr = JSON.stringify(materials, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cotiza3d_insumos.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Exportación exitosa",
        description: "Tus insumos han sido exportados a `cotiza3d_insumos.json`.",
      });
    } catch (error) {
      console.error("Error exporting materials:", error);
      toast({
        title: "Error de exportación",
        description: "No se pudieron exportar los insumos.",
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
            throw new Error("El archivo JSON no tiene el formato esperado para los insumos.");
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
      setMaterials(pendingImportData);
      toast({
        title: "Importación exitosa",
        description: "Tus insumos han sido reemplazados con los datos del archivo.",
      });
    }
    setPendingImportData(null);
    setIsImportConfirmOpen(false);
  };


  const materialsWithDescriptions = materials.map(material => {
    const typeInfo = FILAMENT_TYPES.find(ft => ft.value === material.type);
    return {
      ...material,
      description: typeInfo ? typeInfo.description : 'Descripción no disponible.',
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Insumos</h1>
            <p className="text-muted-foreground">Administra tus filamentos de impresión.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            {isHydrated && materials.length > 0 && (
                 <Button variant="outline" onClick={handleExportMaterials}>
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
            
            {isHydrated && materials.length > 0 && (
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente todos
                            tus materiales.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllMaterials} asChild>
                           <Button variant="destructive">Sí, eliminar todo</Button>
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleNewMaterial}>
                <PlusCircle className="mr-2" />
                Nuevo Material
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>{selectedMaterial ? "Editar Material" : "Nuevo Material"}</DialogTitle>
                <DialogDescription>
                    {selectedMaterial ? "Modifica los detalles de tu material." : "Añade un nuevo filamento a tu inventario."}
                </DialogDescription>
                </DialogHeader>
                <MaterialForm
                onSubmit={handleSaveMaterial}
                defaultValues={selectedMaterial}
                onCancel={() => setIsFormOpen(false)}
                />
            </DialogContent>
            </Dialog>

             <AlertDialog open={isImportConfirmOpen} onOpenChange={setIsImportConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Importación</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro de que deseas reemplazar todos tus insumos actuales con los datos del archivo importado? Esta acción no se puede deshacer.
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

      <MaterialsGrid
        materials={materialsWithDescriptions}
        onEdit={handleEditMaterial}
        onDelete={handleDeleteMaterial}
        isHydrated={isHydrated}
      />
    </div>
  )
}


"use client"

import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS, FILAMENT_TYPES } from "@/lib/constants"
import { DEFAULT_MATERIALS } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
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

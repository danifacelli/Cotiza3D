
"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { Download, Upload } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function BackupRestore() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImportAlertOpen, setIsImportAlertOpen] = useState(false)
  const [fileToImport, setFileToImport] = useState<File | null>(null)

  const handleExport = () => {
    try {
      const dataToExport = {
        [LOCAL_STORAGE_KEYS.SETTINGS]: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS) || "{}"),
        [LOCAL_STORAGE_KEYS.MATERIALS]: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.MATERIALS) || "[]"),
        [LOCAL_STORAGE_KEYS.MACHINES]: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.MACHINES) || "[]"),
        [LOCAL_STORAGE_KEYS.QUOTES]: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.QUOTES) || "[]"),
        [LOCAL_STORAGE_KEYS.INVESTMENTS]: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.INVESTMENTS) || "[]"),
        [LOCAL_STORAGE_KEYS.FUTURE_PURCHASES]: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.FUTURE_PURCHASES) || "[]"),
      };

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split("T")[0];
      link.download = `cotiza3d_backup_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportación exitosa",
        description: "Todos tus datos han sido exportados a un archivo JSON.",
      });
    } catch (error) {
      console.error("Failed to export data:", error);
      toast({
        title: "Error en la exportación",
        description: "No se pudieron exportar tus datos.",
        variant: "destructive",
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setFileToImport(file);
        setIsImportAlertOpen(true);
    }
    // Reset file input to allow importing the same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const confirmImport = () => {
    if (!fileToImport) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") {
          throw new Error("El archivo no es válido.");
        }
        const importedData = JSON.parse(text);
        
        // Basic validation
        if (
            !importedData[LOCAL_STORAGE_KEYS.SETTINGS] ||
            !Array.isArray(importedData[LOCAL_STORAGE_KEYS.MATERIALS]) ||
            !Array.isArray(importedData[LOCAL_STORAGE_KEYS.MACHINES]) ||
            !Array.isArray(importedData[LOCAL_STORAGE_KEYS.QUOTES]) ||
            !Array.isArray(importedData[LOCAL_STORAGE_KEYS.INVESTMENTS]) ||
            !Array.isArray(importedData[LOCAL_STORAGE_KEYS.FUTURE_PURCHASES])
        ) {
            // For backwards compatibility, check if future_purchases is missing
            if (importedData[LOCAL_STORAGE_KEYS.FUTURE_PURCHASES] === undefined) {
              importedData[LOCAL_STORAGE_KEYS.FUTURE_PURCHASES] = [];
            } else {
              throw new Error("El formato del archivo JSON no es válido.");
            }
        }

        // Import data
        Object.keys(LOCAL_STORAGE_KEYS).forEach(key => {
            const storageKey = (LOCAL_STORAGE_KEYS as any)[key];
            if (importedData[storageKey]) {
                localStorage.setItem(storageKey, JSON.stringify(importedData[storageKey]));
            }
        })

        toast({
          title: "Importación completada",
          description: "Tus datos han sido restaurados. La página se recargará.",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (error) {
        console.error("Failed to import data:", error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
        toast({
          title: "Error en la importación",
          description: `No se pudo leer el archivo. ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setFileToImport(null);
        setIsImportAlertOpen(false);
      }
    };
    reader.readAsText(fileToImport);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4">
        <Button onClick={handleExport}>
          <Download className="mr-2" />
          Exportar Todo
        </Button>
        <Button variant="outline" onClick={handleImportClick}>
          <Upload className="mr-2" />
          Importar Todo
        </Button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
      <AlertDialog open={isImportAlertOpen} onOpenChange={setIsImportAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que deseas importar?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se borrarán todos los datos actuales (presupuestos, máquinas, insumos y configuración) y se reemplazarán con los datos del archivo seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFileToImport(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
                <Button variant="destructive" onClick={confirmImport}>Sí, importar y sobreescribir</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

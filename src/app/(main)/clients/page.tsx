
"use client"

import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { DEFAULT_CLIENTS, generateId } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import type { Client } from "@/lib/types"
import { ClientForm, type ClientFormValues } from "@/components/clients/client-form"
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
import { ClientsTable } from "@/components/clients/clients-table"

export default function ClientsPage() {
  const [clients, setClients, isHydrated] = useLocalStorage<Client[]>(
    LOCAL_STORAGE_KEYS.CLIENTS,
    DEFAULT_CLIENTS
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const { toast } = useToast()

  const handleNewClient = () => {
    setSelectedClient(null)
    setIsFormOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsFormOpen(true)
  }

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id))
    toast({
      title: "Cliente eliminado",
      description: "El cliente ha sido eliminado correctamente.",
    })
  }
  
  const handleDeleteAllClients = () => {
    setClients([])
    toast({
      title: "Todos los clientes han sido eliminados",
      description: "Tu lista de clientes está ahora vacía.",
    })
  }

  const handleSaveClient = (data: ClientFormValues) => {
    if (selectedClient) {
      setClients(
        clients.map((c) =>
          c.id === selectedClient.id ? { ...c, ...data } : c
        )
      )
      toast({
        title: "Cliente actualizado",
        description: "Los cambios han sido guardados.",
      })
    } else {
      const newClient: Client = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
      }
      setClients([newClient, ...clients])
       toast({
        title: "Cliente creado",
        description: "El nuevo cliente ha sido agregado.",
      })
    }
    setIsFormOpen(false)
    setSelectedClient(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">Administra tu lista de clientes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            {isHydrated && clients.length > 0 && (
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
                            tus clientes y cualquier vínculo con los presupuestos.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllClients} asChild>
                           <Button variant="destructive">Sí, eliminar todo</Button>
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleNewClient}>
                <PlusCircle className="mr-2" />
                Nuevo Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                <DialogTitle>{selectedClient ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
                <DialogDescription>
                    {selectedClient ? "Modifica los detalles de tu cliente." : "Añade un nuevo cliente a tu lista."}
                </DialogDescription>
                </DialogHeader>
                <ClientForm
                    onSubmit={handleSaveClient}
                    defaultValues={selectedClient}
                    onCancel={() => setIsFormOpen(false)}
                />
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <ClientsTable
        clients={clients}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
        isHydrated={isHydrated}
      />
    </div>
  )
}

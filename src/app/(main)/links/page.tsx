
"use client"

import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { DEFAULT_LINKS, generateId } from "@/lib/defaults"
import type { LinkItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { LinkForm, type LinkFormValues } from "@/components/links/link-form"
import { LinksTable } from "@/components/links/links-table"

export default function LinksPage() {
  const [links, setLinks, isHydrated] = useLocalStorage<LinkItem[]>(LOCAL_STORAGE_KEYS.LINKS, DEFAULT_LINKS)
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null)
  
  const { toast } = useToast()

  const handleNewLink = () => {
    setSelectedLink(null)
    setIsFormOpen(true)
  }

  const handleEditLink = (link: LinkItem) => {
    setSelectedLink(link)
    setIsFormOpen(true)
  }

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((p) => p.id !== id))
    toast({
      title: "Enlace eliminado",
      description: "El enlace ha sido eliminado de tu lista.",
    })
  }
  
  const handleSaveLink = (data: LinkFormValues) => {
    if (selectedLink) {
      setLinks(
        links.map((p) =>
          p.id === selectedLink.id ? { ...p, ...data } : p
        )
      )
      toast({
        title: "Enlace actualizado",
        description: "Los cambios han sido guardados.",
      })
    } else {
      const newLink: LinkItem = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
      }
      setLinks([newLink, ...links].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
       toast({
        title: "Enlace añadido",
        description: "El nuevo enlace ha sido agregado a tu lista.",
      })
    }
    setIsFormOpen(false)
    setSelectedLink(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Links de Interés</h1>
          <p className="text-muted-foreground">
            Organiza tu colección de enlaces y recursos útiles.
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleNewLink}>
                <PlusCircle className="mr-2" />
                Añadir Link
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                <DialogTitle>{selectedLink ? "Editar Link" : "Nuevo Link"}</DialogTitle>
                <DialogDescription>
                    {selectedLink ? "Modifica los detalles del enlace." : "Añade un nuevo enlace a tu colección."}
                </DialogDescription>
                </DialogHeader>
                <LinkForm
                    onSubmit={handleSaveLink}
                    defaultValues={selectedLink}
                    onCancel={() => setIsFormOpen(false)}
                />
            </DialogContent>
        </Dialog>
      </div>

       <LinksTable
        links={links}
        onEdit={handleEditLink}
        onDelete={handleDeleteLink}
        isHydrated={isHydrated}
      />
    </div>
  )
}

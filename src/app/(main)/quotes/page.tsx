
"use client"

import { useState } from "react"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import type { Quote } from "@/lib/types"
import { DEFAULT_QUOTES, generateId } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
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
import { QuotesTable } from "@/components/quotes/quotes-table"

export default function QuotesPage() {
  const [quotes, setQuotes, isHydrated] = useLocalStorage<Quote[]>(
    LOCAL_STORAGE_KEYS.QUOTES,
    DEFAULT_QUOTES
  )
  const { toast } = useToast()

  const handleDeleteQuote = (id: string) => {
    setQuotes(quotes.filter((q) => q.id !== id))
    toast({
      title: "Presupuesto eliminado",
      description: "El presupuesto ha sido eliminado correctamente.",
    })
  }

  const handleDuplicateQuote = (id: string) => {
    const quoteToDuplicate = quotes.find((q) => q.id === id)
    if (quoteToDuplicate) {
      const newQuote: Quote = {
        ...quoteToDuplicate,
        id: generateId(),
        name: `${quoteToDuplicate.name} (Copia)`,
        status: "draft",
        createdAt: new Date().toISOString(),
      }
      setQuotes([newQuote, ...quotes])
      toast({
        title: "Presupuesto duplicado",
        description: "Se ha creado una copia del presupuesto.",
      })
    }
  }

  const handleDeleteAllQuotes = () => {
    setQuotes([])
    toast({
      title: "Todos los presupuestos han sido eliminados",
      description: "Tu lista de presupuestos está ahora vacía.",
    })
  }
  
  const handleUpdateStatus = (id: string, status: Quote['status']) => {
    setQuotes(
      quotes.map((q) => (q.id === id ? { ...q, status } : q))
    );
    toast({
      title: "Estado actualizado",
      description: `El presupuesto ha sido marcado como ${status === 'accepted' ? 'aceptado' : 'cancelado'}.`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Presupuestos</h1>
          <p className="text-muted-foreground">
            Administra tus presupuestos de impresión 3D.
          </p>
        </div>
        <div className="flex gap-2">
          {isHydrated && quotes.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive-outline">
                  <Trash2 className="mr-2" />
                  Eliminar Todo
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    ¿Estás absolutamente seguro?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará
                    permanemente todos tus presupuestos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllQuotes} asChild>
                    <Button variant="destructive">Sí, eliminar todo</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button asChild>
            <Link href="/quotes/new">
              <PlusCircle className="mr-2" />
              Nuevo Presupuesto
            </Link>
          </Button>
        </div>
      </div>

      <QuotesTable
        quotes={quotes}
        onDelete={handleDeleteQuote}
        onDuplicate={handleDuplicateQuote}
        onUpdateStatus={handleUpdateStatus}
        isHydrated={isHydrated}
      />
    </div>
  )
}

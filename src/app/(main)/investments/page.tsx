
"use client"

import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"
import { DEFAULT_INVESTMENTS, generateId } from "@/lib/defaults"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2 } from "lucide-react"
import type { Investment } from "@/lib/types"
import { InvestmentForm } from "@/components/investments/investment-form"
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
import { InvestmentsTable } from "@/components/investments/investments-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

type InvestmentFormData = {
    name: string;
    amount: number;
    createdAt: Date;
}

export default function InvestmentsPage() {
  const [investments, setInvestments, isHydrated] = useLocalStorage<Investment[]>(
    LOCAL_STORAGE_KEYS.INVESTMENTS,
    DEFAULT_INVESTMENTS
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)
  const { toast } = useToast()

  const handleNewInvestment = () => {
    setSelectedInvestment(null)
    setIsFormOpen(true)
  }

  const handleEditInvestment = (investment: Investment) => {
    setSelectedInvestment(investment)
    setIsFormOpen(true)
  }

  const handleDeleteInvestment = (id: string) => {
    setInvestments(investments.filter((i) => i.id !== id))
    toast({
      title: "Inversión eliminada",
      description: "La inversión ha sido eliminada correctamente.",
    })
  }

  const handleDeleteAll = () => {
    setInvestments([])
    toast({
      title: "Todas las inversiones han sido eliminadas",
      description: "Tu lista de inversiones está ahora vacía.",
    })
  }

  const handleSaveInvestment = (data: InvestmentFormData) => {
    const investmentData = {
        ...data,
        createdAt: data.createdAt.toISOString(),
    }
    if (selectedInvestment) {
      setInvestments(
        investments.map((i) =>
          i.id === selectedInvestment.id ? { ...i, ...investmentData } : i
        )
      )
      toast({
        title: "Inversión actualizada",
        description: "Los cambios han sido guardados.",
      })
    } else {
      const newInvestment: Investment = {
        id: generateId(),
        ...investmentData,
      }
      setInvestments([newInvestment, ...investments])
       toast({
        title: "Inversión creada",
        description: "La nueva inversión ha sido agregada.",
      })
    }
    setIsFormOpen(false)
    setSelectedInvestment(null)
  }

  const totalInvested = investments.reduce((acc, inv) => acc + inv.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Inversiones</h1>
            <p className="text-muted-foreground">Administra tus gastos de capital y compras de equipo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            {isHydrated && investments.length > 0 && (
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
                            Esta acción no se puede deshacer. Esto eliminará permanentemente todas tus inversiones.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAll} asChild>
                            <Button variant="destructive">Sí, eliminar todo</Button>
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={handleNewInvestment}>
                <PlusCircle className="mr-2" />
                Nueva Inversión
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>{selectedInvestment ? "Editar Inversión" : "Nueva Inversión"}</DialogTitle>
                <DialogDescription>
                    {selectedInvestment ? "Modifica los detalles de tu inversión." : "Añade una nueva inversión a tu lista."}
                </DialogDescription>
                </DialogHeader>
                <InvestmentForm
                onSubmit={handleSaveInvestment}
                defaultValues={selectedInvestment}
                onCancel={() => setIsFormOpen(false)}
                />
            </DialogContent>
            </Dialog>
        </div>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Total Invertido</CardTitle>
            <CardDescription>Suma de todos tus gastos de capital.</CardDescription>
        </CardHeader>
        <CardContent>
            {isHydrated ? (
                 <p className="text-3xl font-bold">{formatCurrency(totalInvested, "USD", 2)}</p>
            ) : (
                <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
            )}
        </CardContent>
       </Card>

      <InvestmentsTable
        investments={investments}
        onEdit={handleEditInvestment}
        onDelete={handleDeleteInvestment}
        isHydrated={isHydrated}
      />
    </div>
  )
}

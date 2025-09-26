
"use client"

import type { Settings, ExtraCost } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface DesignExtraCostsTableProps {
  costs: ExtraCost[]
  onRemove: (index: number) => void
  settings: Settings
}

export function DesignExtraCostsTable({ costs, onRemove, settings }: DesignExtraCostsTableProps) {
  if (costs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed text-center h-24">
        <p className="text-sm text-muted-foreground">No hay costos adicionales.</p>
      </div>
    )
  }

  const total = costs.reduce((acc, cost) => acc + cost.amount, 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-[120px] text-right">Monto (USD)</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costs.map((cost, index) => (
            <TableRow key={cost.id}>
              <TableCell className="font-medium">{cost.description}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(cost.amount, "USD", settings.currencyDecimalPlaces)}
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
           <TableRow className="font-bold bg-muted/50">
              <TableCell>Total Adicional</TableCell>
              <TableCell className="text-right">
                {formatCurrency(total, "USD", settings.currencyDecimalPlaces)}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}


"use client"

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

interface PartRow {
  id: string
  name: string
  materialGrams: number
  width?: number
  height?: number
  depth?: number
}

interface QuotePartsTableProps {
  parts: PartRow[]
  onRemove: (index: number) => void
}

export function QuotePartsTable({ parts, onRemove }: QuotePartsTableProps) {
  if (parts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed text-center h-24">
        <p className="text-sm text-muted-foreground">Aún no has añadido piezas.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead className="text-right">Peso (g)</TableHead>
            <TableHead className="text-right">Dimensiones (mm)</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part, index) => (
            <TableRow key={part.id}>
              <TableCell className="font-medium">{part.name}</TableCell>
              <TableCell className="text-right">{part.materialGrams} g</TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {part.width || 0} x {part.height || 0} x {part.depth || 0}
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
        </TableBody>
      </Table>
    </div>
  )
}

    
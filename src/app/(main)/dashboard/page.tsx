import Link from "next/link"
import {
  ArrowUpRight,
  Cpu,
  FileText,
  Package,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              Bienvenido a Cotiza3D
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">
              La herramienta definitiva para calcular los costos de tus impresiones 3D.
            </div>
            <p className="pt-4">
              Comienza por configurar tus insumos y máquinas, o crea tu primer presupuesto.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
              <Button asChild className="w-full">
                <Link href="/quotes/new">
                  <FileText className="mr-2 h-4 w-4" /> Nuevo Presupuesto
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/materials">
                  <Package className="mr-2 h-4 w-4" /> Administrar Insumos
                </Link>
              </Button>
               <Button asChild variant="secondary" className="w-full">
                <Link href="/machines">
                  <Cpu className="mr-2 h-4 w-4" /> Administrar Máquinas
                </Link>
              </Button>
          </CardContent>
        </Card>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Comenzando</CardTitle>
            <CardDescription>
              Sigue estos pasos para obtener el máximo provecho de Cotiza3D.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
             <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">1</div>
                <div>
                    <h3 className="font-semibold">Configura tus Parámetros</h3>
                    <p className="text-sm text-muted-foreground">
                        Ve a <Link href="/settings" className="underline">Configuración</Link> para establecer tu moneda, costos de energía, mano de obra y márgenes de ganancia.
                    </p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">2</div>
                <div>
                    <h3 className="font-semibold">Añade Insumos y Máquinas</h3>
                    <p className="text-sm text-muted-foreground">
                       Registra los filamentos que usas en <Link href="/materials" className="underline">Insumos</Link> y tus impresoras en <Link href="/machines" className="underline">Máquinas</Link>.
                    </p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">3</div>
                <div>
                    <h3 className="font-semibold">Crea un Presupuesto</h3>
                    <p className="text-sm text-muted-foreground">
                        Con todo configurado, dirígete a <Link href="/quotes/new" className="underline">Nuevo Presupuesto</Link> para hacer tu primer cálculo.
                    </p>
                </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

import Link from "next/link"
import {
  ArrowUpRight,
  Cpu,
  FileText,
  Package,
  Settings,
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
        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
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
             <Button asChild className="mt-4">
                <Link href="/quotes/new">
                  <FileText className="mr-2 h-4 w-4" /> Nuevo Presupuesto
                </Link>
              </Button>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <Card className="hover:bg-accent/10 transition-colors">
                 <Link href="/materials">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Insumos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                            Administra tus filamentos
                        </div>
                    </CardContent>
                 </Link>
            </Card>
             <Card className="hover:bg-accent/10 transition-colors">
                <Link href="/machines">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Máquinas</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                           Define tus impresoras
                        </div>
                    </CardContent>
                </Link>
            </Card>
            <Card className="hover:bg-accent/10 transition-colors col-span-2">
                 <Link href="/settings">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Configuración</CardTitle>
                         <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-muted-foreground">
                           Ajusta parámetros y costos
                        </div>
                    </CardContent>
                 </Link>
            </Card>
        </div>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Comenzando</CardTitle>
            <CardDescription>
              Sigue estos pasos para obtener el máximo provecho de Cotiza3D.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
             <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">1</div>
                <div>
                    <h3 className="font-semibold">Configura tus Parámetros</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Establece tu moneda, costos de energía, mano de obra y márgenes de ganancia.
                    </p>
                    <Button variant="link" asChild size="sm"><Link href="/settings">Ir a Configuración</Link></Button>
                </div>
            </div>
             <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">2</div>
                <div>
                    <h3 className="font-semibold">Añade Insumos y Máquinas</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                       Registra los filamentos que usas y tus impresoras para empezar a calcular.
                    </p>
                     <Button variant="link" asChild size="sm"><Link href="/materials">Ir a Insumos</Link></Button>
                </div>
            </div>
             <div className="flex flex-col items-center text-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">3</div>
                <div>
                    <h3 className="font-semibold">Crea un Presupuesto</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Con todo configurado, dirígete a crear tu primer cálculo de costos.
                    </p>
                    <Button variant="link" asChild size="sm"><Link href="/quotes/new">Crear Presupuesto</Link></Button>
                </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

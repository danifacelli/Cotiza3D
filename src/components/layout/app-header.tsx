
"use client"
import Link from "next/link"
import {
  Home,
  Layers,
  PanelLeft,
  Settings,
  FileText,
  Printer,
  Banknote,
  ShoppingCart,
  Users,
  Link2,
  GalleryHorizontal,
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/icons/logo"

const navLinks = [
    { href: "/dashboard", icon: Home, label: "Dashboard", className: "text-muted-foreground hover:text-foreground" },
    { href: "/designs", icon: GalleryHorizontal, label: "Diseños", className: "text-muted-foreground hover:text-foreground" },
    { href: "/quotes", icon: FileText, label: "Presupuestos", className: "text-muted-foreground hover:text-foreground" },
    { href: "/clients", icon: Users, label: "Clientes", className: "text-muted-foreground hover:text-foreground" },
    { href: "/materials", icon: Layers, label: "Insumos", className: "text-muted-foreground hover:text-foreground" },
    { href: "/machines", icon: Printer, label: "Máquinas", className: "text-muted-foreground hover:text-foreground" },
    { href: "/investments", icon: Banknote, label: "Inversiones", className: "text-muted-foreground hover:text-foreground" },
    { href: "/future-purchases", icon: ShoppingCart, label: "Futuras Compras", className: "text-muted-foreground hover:text-foreground" },
    { href: "/links", icon: Link2, label: "Links", className: "text-muted-foreground hover:text-foreground" },
    { href: "/settings", icon: Settings, label: "Configuración", className: "text-muted-foreground hover:text-foreground" },
]

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Cotiza3D</span>
            </Link>
            {navLinks.map(({ href, icon: Icon, label, className }) => (
                 <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-4 px-2.5 ${className}`}
                >
                    <Icon className="h-5 w-5" />
                    {label}
                </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Can add breadcrumbs or search here later */}
      </div>
      <ThemeToggle />
    </header>
  )
}

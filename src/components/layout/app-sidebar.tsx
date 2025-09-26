
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Home, Layers, Settings, FileText, Printer, Banknote, ShoppingCart, Users, Link2, GalleryHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/designs", icon: GalleryHorizontal, label: "Diseños" },
  { href: "/quotes", icon: FileText, label: "Presupuestos" },
  { href: "/clients", icon: Users, label: "Clientes" },
  { href: "/materials", icon: Layers, label: "Insumos" },
  { href: "/machines", icon: Printer, label: "Máquinas" },
  { href: "/investments", icon: Banknote, label: "Inversiones" },
  { href: "/future-purchases", icon: ShoppingCart, label: "Futuras Compras" },
  { href: "/links", icon: Link2, label: "Links" },
  { href: "/settings", icon: Settings, label: "Configuración" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    </aside>
  );
}

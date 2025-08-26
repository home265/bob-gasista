// components/ui/AppHeader.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string };

export default function AppHeader({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  return (
    // MODIFICADO: Usamos las variables de color del nuevo tema
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* MODIFICADO: Título consistente con "Bob Seco" */}
        <Link href="/" className="font-bold text-lg text-foreground hover:opacity-90">
          Bob Gasista
        </Link>
        <ul className="flex items-center gap-6 text-sm">
          {tabs.map((t) => {
            // Lógica para determinar si el link está activo
            const isActive = t.href === "/" ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  // MODIFICADO: Clases para el estado activo/inactivo que funcionan con el tema oscuro
                  className={`
                    font-medium transition-colors
                    ${isActive 
                      ? 'text-base' // El color --color-base (verde/cyan) para el link activo
                      : 'text-foreground/70 hover:text-foreground' // Grisáceo para inactivos
                    }
                  `}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string };

export default function AppHeader({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <nav className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <div className="font-semibold">Calculadora Gas</div>
        <ul className="flex gap-4 text-sm">
          {tabs.map((t) => {
            const active = pathname === t.href || pathname?.startsWith(t.href + "/");
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className={`px-2 py-1 rounded ${active ? "bg-[color:var(--color-neutral)] text-[color:var(--color-primary)]" : "text-foreground/70 hover:text-foreground"}`}
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

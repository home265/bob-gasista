// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./register-sw";
import AppHeader from "@/components/ui/AppHeader"; 

export const metadata: Metadata = {
  title: {
    default: "Bob Gasista - Termofusión",
    template: "%s | Bob Gasista",
  },
  description: "Cómputo de materiales para instalaciones de gas por termofusión.",
  applicationName: "Bob Gasista",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2C3333", // El color primario de tu paleta
};

// --- CORRECCIÓN AQUÍ ---
// Se actualizó el enlace para que apunte a la nueva calculadora integral.
const TABS = [
  { href: "/", label: "Inicio" },
  { href: "/gas/calculo", label: "Cálculo Gas" },
  { href: "/proyecto", label: "Proyectos" },
  { href: "/ayuda", label: "Ayuda" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className="h-full">
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <RegisterSW />
        
        <AppHeader tabs={TABS} />

        <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">{children}</main>

        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-foreground/60">
          Hecho con ♥ · Funciona offline (PWA)
        </footer>
      </body>
    </html>
  );
}
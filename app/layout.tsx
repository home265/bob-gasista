// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./register-sw";
import AppHeader from "@/components/ui/AppHeader"; 

export const metadata: Metadata = {
  title: {
    default: "Bob Gasista - Calculadora de Proyectos",
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
  themeColor: "#2C3333",
};

// --- CORRECCIÓN AQUÍ ---
// Se actualizan los enlaces para el nuevo flujo de trabajo centrado en proyectos.
const TABS = [
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
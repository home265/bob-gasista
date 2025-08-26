// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./register-sw";

export const metadata: Metadata = {
  title: {
    default: "Calculadora Gas | Bob",
    template: "%s | Calculadora Gas",
  },
  description: "Mini app PWA para cálculo de materiales en instalaciones de gas.",
  applicationName: "Calculadora Gas",
  manifest: "/manifest.webmanifest",
  // themeColor se elimina de aquí
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Calculadora Gas",
  },
};

// themeColor ahora vive únicamente aquí
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
          <nav className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
            <div className="font-semibold">Calculadora Gas</div>
            <div className="text-sm text-foreground/60">
              <a className="hover:underline" href="/">Inicio</a>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">{children}</main>

        <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-foreground/60">
          Hecho con ♥ · Funciona offline (PWA)
        </footer>

        {/* Registro del Service Worker */}
        <RegisterSW />
      </body>
    </html>
  );
}
// app/page.tsx
export default function Home() {
  return (
    <section className="space-y-6">
      <div className="card p-4">
        <h1 className="text-2xl font-semibold">Calculadora Gas Domiciliario</h1>
        <p className="text-sm text-foreground/70">
          Mini-app PWA. Elegí un módulo y empezá a cargar tu instalación.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <a href="/offline" className="card p-4 hover:outline hover:outline-1 hover:outline-[var(--border)]">
          <div className="font-medium">Probar modo offline</div>
          <div className="text-sm text-foreground/60">Página de fallback sin conexión</div>
        </a>
        {/* Más accesos a módulos cuando los creemos */}
      </div>
    </section>
  );
}

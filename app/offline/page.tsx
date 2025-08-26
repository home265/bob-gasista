// app/offline/page.tsx
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div className="card p-5">
        <h1 className="text-xl font-semibold">Estás sin conexión</h1>
        <p className="text-sm text-foreground/70">
          Podés seguir navegando lo que tengas en caché. Cuando vuelva Internet, la app se sincroniza sola.
        </p>
      </div>
    </section>
  );
}

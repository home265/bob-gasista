"use client";

import { useParams } from "next/navigation";
import { getProject } from "@/lib/project/storage";
import { aggregateMaterials } from "@/lib/project/compute";
import type { Project } from "@/lib/project/types";

export default function ProyectoExportPage() {
  const { id } = useParams<{ id: string }>();
  const pMaybe = getProject(id);
  if (!pMaybe) return <div className="p-6">Proyecto no encontrado.</div>;

  const p: Project = pMaybe;
  const mat = aggregateMaterials(p);

  return (
    <section className="space-y-4 print:space-y-2">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-semibold">Imprimir / PDF</h1>
        <button className="btn" onClick={() => window.print()}>Imprimir</button>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-medium text-lg">{p.name}</h2>
        <div className="text-sm text-foreground/70">
          Cliente: {p.client || "-"} · Obra: {p.siteAddress || "-"}
        </div>
      </div>

      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">Partidas</h3>
        {p.partes.length === 0 ? (
          <p className="text-sm text-foreground/60">Sin partidas.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {p.partes.map((pt) => (
              <li key={pt.id}>
                • {pt.title} <span className="text-foreground/60">({pt.kind})</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">Resumen de materiales</h3>
        {mat.length === 0 ? (
          <p className="text-sm text-foreground/60">—</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-foreground/60">
              <tr>
                <th className="text-left py-1">Material</th>
                <th className="text-right py-1">Cantidad</th>
                <th className="text-left py-1">Unidad</th>
              </tr>
            </thead>
            <tbody>
              {mat.map((m, i) => (
                <tr key={`${m.key ?? m.label}-${i}`} className="border-t">
                  <td className="py-1">{m.label}</td>
                  <td className="py-1 text-right">{m.qty}</td>
                  <td className="py-1">{m.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx global>{`
        @media print {
          header, footer, nav, .print\\:hidden { display: none !important; }
          .print\\:space-y-2 > * + * { margin-top: .5rem; }
          body { background: #fff; }
        }
      `}</style>
    </section>
  );
}

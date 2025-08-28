"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { getProject } from "@/lib/project/storage";
import { aggregateMaterials } from "@/lib/project/compute";
import type { Project } from "@/lib/project/types";
import type { BocaInput } from "@/lib/gas/types"; // Importamos el tipo BocaInput
import GasSketch from "@/components/gas/GasSketch"; // Importamos el componente del boceto

export default function ProyectoExportPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getProject(id).then(p => {
        if (p) {
          setProject(p);
        }
        setIsLoading(false);
      });
    }
  }, [id]);

  // --- MODIFICACIÓN AQUÍ: AHORA TAMBIÉN EXTRAEMOS LAS BOCAS ---
  const { mat, bocas } = useMemo(() => {
    if (!project) return { mat: [], bocas: [] };
    const materials = aggregateMaterials(project);
    const gasPartida = project.partes.find(p => p.kind === 'gas_instalacion');
    const projectBocas = (gasPartida?.inputs as { bocas?: BocaInput[] })?.bocas || [];
    return { mat: materials, bocas: projectBocas };
  }, [project]);

  if (isLoading) {
    return <div className="p-6">Cargando datos para exportar...</div>;
  }

  if (!project) {
    return <div className="p-6">Proyecto no encontrado.</div>;
  }

  return (
    <section className="space-y-4 print:space-y-2">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-semibold">Imprimir / PDF</h1>
        <button className="btn btn-primary" onClick={() => window.print()}>Imprimir</button>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-medium text-lg">{project.name}</h2>
        <div className="text-sm text-foreground/70">
          Cliente: {project.client || "-"} · Obra: {project.siteAddress || "-"}
        </div>
      </div>
      
      {/* --- NUEVO BLOQUE: SE AÑADE EL BOCETO A LA VISTA PREVIA --- */}
      {bocas.length > 0 && (
          <div className="border rounded p-4">
              <h3 className="font-medium mb-2">Boceto de la Instalación</h3>
              <GasSketch bocas={bocas} />
          </div>
      )}

      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">Partidas</h3>
        {project.partes.length === 0 ? (
          <p className="text-sm text-foreground/60">Sin partidas.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {project.partes.map((pt) => (
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
          body { background: #fff; color: #000; }
        }
      `}</style>
    </section>
  );
}
// app/proyecto/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Canvg } from 'canvg';

import { getProject } from "@/lib/project/storage";
import { aggregateMaterials } from "@/lib/project/compute";
import { generateSvgString } from "@/lib/gas/drawing";
// --- CORRECCIÓN DE IMPORTACIÓN AQUÍ ---
import type { Project } from "@/lib/project/types";
import type { BocaInput } from "@/lib/gas/types"; // Se importa desde la ruta correcta.

export default function ProyectoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      setIsLoading(true);
      const p = await getProject(id);
      if (p) {
        setProject(p);
      } else {
        router.replace("/proyecto");
      }
      setIsLoading(false);
    };
    fetchProject();
  }, [id, router]);

  const { mat, safeName, bocas } = useMemo(() => {
    if (!project) return { mat: [], safeName: "", bocas: [] };
    
    const materials = aggregateMaterials(project);
    const sanitizedName = project.name.replace(/[^\w\-]+/g, "_").toLowerCase();
    
    const gasPartida = project.partes.find(p => p.kind === 'gas_instalacion');
    const projectBocas = (gasPartida?.inputs as { bocas?: BocaInput[] })?.bocas || [];

    return { mat: materials, safeName: sanitizedName, bocas: projectBocas };
  }, [project]);

  async function handleSharePdf() {
    if (!project) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Resumen de Proyecto", 14, 22);
    doc.setFontSize(12);
    doc.text(project.name, 14, 32);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Cliente: ${project.client || "-"}`, 14, 38);
    doc.text(`Obra: ${project.siteAddress || "-"}`, 14, 44);

    let tableStartY = 55;

    const { svg, width, height } = generateSvgString(bocas);
    if (svg && width > 0 && height > 0) {
      doc.setFontSize(14);
      doc.text("Boceto de la Instalación", 14, 60);
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // --- CORRECCIÓN DE 'canvg' AQUÍ ---
      // Ya no pasamos la opción 'styles' porque están dentro del SVG.
      const v = await Canvg.from(ctx!, svg);
      await v.render();
      
      const pdfImageWidth = 180;
      const pdfImageHeight = (height * pdfImageWidth) / width;
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 14, 68, pdfImageWidth, pdfImageHeight);
      
      tableStartY = 68 + pdfImageHeight + 10;
    }
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['Material', 'Cantidad', 'Unidad']],
      body: mat.map(m => [m.label, m.qty, m.unit]),
      theme: 'grid',
      headStyles: { fillColor: [46, 79, 79] },
    });

    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], `proyecto_${safeName}.pdf`, { type: 'application/pdf' });

    type NavigatorWithShare = Navigator & {
        canShare?: (data?: { files: File[] }) => boolean;
        share?: (data?: { files?: File[]; title?: string; text?: string; }) => Promise<void>;
    };
    const nav = navigator as NavigatorWithShare;

    if (nav.canShare && nav.canShare({ files: [pdfFile] })) {
      try {
        await nav.share({
          title: `Proyecto - ${project.name}`,
          text: `Resumen de materiales para el proyecto "${project.name}"`,
          files: [pdfFile],
        });
      } catch (error) {
        console.error("El usuario canceló la acción de compartir.", error);
      }
    } else {
      doc.save(`proyecto_${safeName}.pdf`);
    }
  }
  
  if (isLoading || !project) {
    return (
      <section className="space-y-6 container mx-auto px-4 max-w-5xl">
        <p className="text-center text-foreground/60 p-8">Cargando proyecto...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 container mx-auto px-4 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <div className="text-sm text-foreground/60">
            {project.client ? `Cliente: ${project.client} · ` : ""}{project.siteAddress || ""}
          </div>
        </div>
        <div className="flex items-center space-x-2">
            <Link className="btn btn-secondary" href={`/proyecto/${project.id}/export`}>
              Vista Previa
            </Link>
            <button className="btn btn-primary" onClick={handleSharePdf}>
              Compartir PDF
            </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-medium mb-3">Partidas del Proyecto</h2>
          {project.partes.length === 0 ? (
            <p className="text-sm text-foreground/60">Aún no se ha guardado ningún cálculo para este proyecto.</p>
          ) : (
            <ul className="space-y-2">
              {project.partes.map(part => (
                <li key={part.id} className="border rounded p-3">
                  <div className="text-sm font-medium">{part.title}</div>
                  <div className="text-xs text-foreground/60 uppercase">{part.kind.replace("_", " ")}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-4 overflow-x-auto">
          <h2 className="font-medium mb-3">Resumen de Materiales</h2>
          {mat.length === 0 ? (
            <p className="text-sm text-foreground/60">Sin materiales aún.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-foreground/60">
                <tr>
                  <th className="text-left py-1">Material</th>
                  <th className="text-right py-1">Cantidad</th>
                  <th className="text-left py-1 pl-2">Unidad</th>
                </tr>
              </thead>
              <tbody>
                {mat.map((m, i) => (
                  <tr key={`${m.key ?? m.label}-${i}`} className="border-t">
                    <td className="py-1">{m.label}</td>
                    <td className="py-1 text-right">{m.qty}</td>
                    <td className="py-1 pl-2">{m.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
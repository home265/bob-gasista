// components/gas/GasSketch.tsx
"use client";

import type { BocaInput } from "@/lib/gas/types";
// --- NUEVA IMPORTACIÓN ---
// Ahora importamos la función que hace el trabajo pesado desde nuestro archivo centralizado.
import { generateSvgString } from "@/lib/gas/drawing";

type Props = {
  bocas: BocaInput[];
};

export default function GasSketch({ bocas }: Props) {
  // Si no hay bocas, no mostramos nada.
  if (bocas.length === 0) {
    return (
      <div className="text-center text-sm text-foreground/60 py-4">
        Agrega bocas para ver el boceto de la instalación.
      </div>
    );
  }

  // --- LÓGICA SIMPLIFICADA ---
  // Obtenemos el código SVG completo directamente desde nuestro nuevo ayudante.
  const { svg } = generateSvgString(bocas);

  // Usamos 'dangerouslySetInnerHTML' para renderizar el string que contiene el SVG.
  // Añadimos clases de Tailwind para asegurar que el SVG se ajuste al contenedor.
  return (
    <div
      className="bg-muted/30 p-2 rounded-lg max-h-96 [&_svg]:w-full [&_svg]:h-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
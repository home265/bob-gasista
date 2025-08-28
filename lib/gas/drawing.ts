// lib/gas/drawing.ts
import type { BocaInput } from "./types";

const SCALE = 20;
const PADDING = 20;
const STROKE_WIDTH = 3;
const CIRCLE_RADIUS = 5;

// Esta función toma las bocas y devuelve el código SVG completo como un string.
export function generateSvgString(bocas: BocaInput[]): { svg: string; width: number; height: number } {
  if (bocas.length === 0) {
    return { svg: "", width: 0, height: 0 };
  }

  const points = [{ x: 0, y: 0, label: "Nicho" }];
  let currentX = 0;
  let currentY = 0;

  bocas.forEach((boca, i) => {
    const distance = boca.distancia_desde_anterior_m || 0;
    switch (boca.direction) {
      case "adelante": currentY -= distance; break;
      case "abajo": currentY += distance; break;
      case "derecha": currentX += distance; break;
      case "izquierda": currentX -= distance; break;
      case "arriba": currentY -= distance; break;
      default: currentY -= distance;
    }
    points.push({ x: currentX, y: currentY, label: `Boca #${i + 1}` });
  });

  const allX = points.map(p => p.x * SCALE);
  const allY = points.map(p => p.y * SCALE);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const width = Math.round(maxX - minX + PADDING * 2);
  const height = Math.round(maxY - minY + PADDING * 2);
  const offsetX = -minX + PADDING;
  const offsetY = -minY + PADDING;

  // --- CORRECCIÓN AQUÍ: Definimos los estilos DENTRO del SVG ---
  const styles = `
    <style>
      .line { stroke: #CBE4DE; stroke-width: ${STROKE_WIDTH}; }
      .circle-nicho { fill: #00FFD1; }
      .circle-boca { fill: #0E8388; }
      .label { font-size: 10px; fill: #CBE4DE; font-family: sans-serif; }
    </style>
  `;

  const lines = points.slice(1).map((point, i) => {
    const prevPoint = points[i];
    return `<line class="line" x1="${prevPoint.x * SCALE + offsetX}" y1="${prevPoint.y * SCALE + offsetY}" x2="${point.x * SCALE + offsetX}" y2="${point.y * SCALE + offsetY}" />`;
  }).join('');

  const circlesAndLabels = points.map((point, i) => {
    const circleClass = i === 0 ? "circle-nicho" : "circle-boca";
    return `
      <g>
        <circle class="${circleClass}" cx="${point.x * SCALE + offsetX}" cy="${point.y * SCALE + offsetY}" r="${CIRCLE_RADIUS}" />
        <text class="label" x="${point.x * SCALE + offsetX + 8}" y="${point.y * SCALE + offsetY + 4}">
          ${point.label}
        </text>
      </g>
    `;
  }).join('');

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${styles}${lines}${circlesAndLabels}</svg>`;

  return { svg, width, height };
}
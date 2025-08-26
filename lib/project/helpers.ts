// lib/project/helpers.ts
import type { MaterialRow, Unit } from "./types";

export function normalizeUnit(u: string): Unit {
  const s = (u || "").toLowerCase();
  if (s === "m²" || s === "m2") return "m2";
  if (s === "m³" || s === "m3") return "m3";
  if (s === "kg") return "kg";
  if (s === "l" || s === "lt" || s === "litros") return "l";
  if (s === "m" || s === "metro" || s === "metros") return "m";
  if (s === "cm") return "cm";
  if (s === "mm") return "mm";
  return "u";
}

export function rowsToMaterials(
  rows: Array<{ key?: string; label: string; qty: number; unit: string }>
): MaterialRow[] {
  return rows
    .filter((r) => Number.isFinite(r.qty) && r.qty > 0)
    .map((r) => ({
      key: r.key,
      label: r.label,
      qty: Math.round(r.qty * 100) / 100,
      unit: normalizeUnit(r.unit),
    }));
}

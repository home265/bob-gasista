// lib/project/compute.ts
import type { MaterialRow, Project } from "./types";

export function aggregateMaterials(p: Project): MaterialRow[] {
  const map = new Map<string, MaterialRow>();
  for (const pt of p.partes) {
    for (const m of pt.materials) {
      const key =
        (m.key ? `k:${m.key}` : `l:${m.label.toLowerCase()}`) + `|u:${m.unit}`;
      const prev = map.get(key);
      if (prev) {
        prev.qty = Math.round((prev.qty + m.qty) * 100) / 100;
      } else {
        map.set(key, { ...m });
      }
    }
  }
  return Array.from(map.values());
}

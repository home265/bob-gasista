// lib/project/types.ts

export type Unit = "u" | "m" | "m2" | "m3" | "kg" | "l" | "cm" | "mm";

export type MaterialRow = {
  key?: string;        // si existe, se usa para agrupar
  label: string;
  qty: number;
  unit: Unit;
};

// --- MODIFICACIÓN AQUÍ ---
// Simplificamos los tipos de partida. Eliminamos las opciones viejas.
export type PartidaKind =
  | "gas_instalacion"   // Para la nueva calculadora integral
  | "custom";           // Para partidas manuales

export type Partida = {
  id: string;
  kind: PartidaKind;
  title: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  materials: MaterialRow[];
  createdAt: number;
  updatedAt: number;
};

export type Project = {
  id: string;
  name: string;
  client?: string;
  siteAddress?: string;
  partes: Partida[];
  createdAt: number;
  updatedAt: number;
};
// lib/project/types.ts

export type Unit = "u" | "m" | "m2" | "m3" | "kg" | "l" | "cm" | "mm";

export type MaterialRow = {
  key?: string;        // si existe, se usa para agrupar
  label: string;
  qty: number;
  unit: Unit;
};

export type PartidaKind =
  | "gas_instalacion"   // resumen general
  | "gas_artefacto"     // cocina / calefón / termotanque / caldera / calefactor
  | "gas_tramo"         // tramo A→C, C→E, etc.
  | "gas_ventilacion"   // rejillas, aireación
  | "custom";

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

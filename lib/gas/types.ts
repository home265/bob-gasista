// lib/gas/types.ts
export type GasKind = "natural" | "lpg";

export type GasOption = {
  id: GasKind;
  label: string;
  poder_calorifico_kcal_m3: number;
  service_pressure_mbar: number;
  max_pressure_drop_mbar: number;
};

export type ApplianceCatalogItem = {
  id: string;
  label: string;
  default_kcal_h: number;
  can_multiplicity?: boolean;
};

export type PipeSystem = {
  id: string;
  label: string;
  diameters_mm: Array<{ dn: number; inner_mm: number }>;
};

export type FittingsEquivalents = {
  // multiplicador en "n·D" (número de diámetros) por accesorio
  equiv_diameters: Record<"elbow_90" | "elbow_45" | "tee_through" | "tee_branch" | "valve", number>;
};

export type CapacityTable = {
  gas: GasKind;
  pressure_mbar: number;
  // por DN, pares [longitud_m, capacidad_m3h] ordenados por longitud ascendente
  diameters_mm: Record<string, Array<[number, number]>>;
};

export type ApplianceInstance = {
  id: string;            // ej. "A1"
  catalogId: string;     // ej. "cocina"
  kcal_h?: number;       // si no se da, se usa default del catálogo
  count?: number;        // multiplicidad (>=1)
};

export type SegmentFittings = Partial<Record<keyof FittingsEquivalents["equiv_diameters"], number>>;

export type SegmentInput = {
  id: string;                            // ej. "C-E"
  real_length_m: number;                 // longitud real
  fittings?: SegmentFittings;            // codos/tees/llaves en el tramo
  // Artefactos que "cuelgan" aguas abajo de este tramo,
  // con su distancia total desde el medidor para criterio “distancia mayor”
  downstream: Array<{ applianceId: string; distance_from_meter_m: number }>;
};

export type JobInput = {
  gas: GasOption;
  system: PipeSystem;
  capacity: CapacityTable;
  fittingsEq: FittingsEquivalents;
  appliancesCatalog: ApplianceCatalogItem[];
  appliances: ApplianceInstance[];
  segments: SegmentInput[];
};

export type SegmentResult = {
  id: string;
  served_m3h: number;
  worst_distance_m: number;
  selected_dn: number;
  effective_length_m: number; // con equivalentes para ese DN
  capacity_m3h: number;
  utilization: number;        // served/capacity
  warning?: string;
};

export type BomItem =
  | { kind: "pipe"; dn: number; length_m: number }
  | { kind: "fitting"; type: keyof FittingsEquivalents["equiv_diameters"]; dn: number; qty: number };

export type ComputeResult = {
  segments: SegmentResult[];
  bom: BomItem[];
};

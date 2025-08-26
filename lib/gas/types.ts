// lib/gas/types.ts

// --- TIPOS DE CATÁLOGO (Datos de referencia, sin cambios) ---

export type GasKind = "natural" | "lpg";

export type GasOption = {
  id: GasKind;
  label: string;
  poder_calorifico_kcal_m3: number;
};

export type PipeSystem = {
  id: string;
  label: string;
  diameters_mm: Array<{ dn: number; inner_mm: number }>;
};

export type ApplianceCatalogItem = {
  id: string;
  label: string;
  default_kcal_h: number;
};

export type FittingsEquivalents = {
  equiv_diameters: Record<"elbow_90" | "elbow_45" | "tee_through" | "tee_branch" | "valve", number>;
};

export type CapacityTable = {
  gas: GasKind;
  pressure_mbar: number;
  diameters_mm: Record<string, Array<[number, number]>>;
};


// --- NUEVOS TIPOS PARA EL FORMULARIO (lo que el usuario ingresa) ---

// Representa un artefacto en la lista del formulario.
export type GasApplianceInput = {
  id: string; // Un ID único para el estado de React (ej: crypto.randomUUID())
  label: string; // Etiqueta puesta por el usuario (ej: "Cocina Ppal")
  catalogId: string; // ID del catálogo (ej: "cocina")
  consumo_kcal_h: number;
};

// Representa un tramo en la lista del formulario. Es más simple que el anterior.
export type GasSegmentInput = {
  id: string; // ID único para el estado de React
  label: string; // Etiqueta del tramo (ej: "Medidor a Cocina")
  longitud_m: number;
  accesorios: {
    codos_90: number;
    codos_45: number;
    llaves_paso: number;
  };
  // El usuario define qué artefactos se conectan al final de este tramo.
  artefactos_servidos: string[]; // Array de IDs de GasApplianceInput
};

// Este es el objeto completo que representa todos los datos del formulario.
export type InstallationInput = {
  gasId: GasKind;
  pipeSystemId: string;
  artefactos: GasApplianceInput[];
  tramos: GasSegmentInput[];
};


// --- TIPOS PARA EL MOTOR DE CÁLCULO (lo que la lógica interna usa) ---

// (Estos tipos se mantienen porque la lógica de cálculo es robusta,
// solo que ahora se construyen a partir del `InstallationInput`)

export type SegmentInternal = {
  id: string;
  real_length_m: number;
  fittings?: Partial<Record<keyof FittingsEquivalents["equiv_diameters"], number>>;
  downstream: Array<{ applianceId: string; distance_from_meter_m: number }>;
};

export type JobInput = {
  gas: GasOption;
  system: PipeSystem;
  capacity: CapacityTable;
  fittingsEq: FittingsEquivalents;
  appliancesCatalog: ApplianceCatalogItem[];
  appliances: Array<{ id: string; catalogId: string; kcal_h: number }>;
  segments: SegmentInternal[];
};

export type SegmentResult = {
  id: string;
  label: string; // Añadimos el label para mostrarlo en resultados
  served_m3h: number;
  worst_distance_m: number;
  selected_dn: number;
  effective_length_m: number;
  capacity_m3h: number;
  utilization: number;
  warning?: string;
};

export type BomItem =
  | { kind: "pipe"; dn: number; length_m: number }
  | { kind: "fitting"; type: keyof FittingsEquivalents["equiv_diameters"]; dn: number; qty: number }
  | { kind: "accessory"; key: string; label: string; qty: number; unit: "u" | "m" };


// --- TIPO DE RESULTADO FINAL (lo que la función de cálculo devuelve) ---
export type ComputeResult = {
  segmentResults: SegmentResult[];
  bom: BomItem[];
  total_m3h: number;
  total_kcalh: number;
};
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
  // Se agrega 'tee' para el nuevo modelo de cálculo
  equiv_diameters: Record<"elbow_90" | "elbow_45" | "tee_through" | "tee_branch" | "valve" | "tee", number>;
};

export type CapacityTable = {
  gas: GasKind;
  pressure_mbar: number;
  diameters_mm: Record<string, Array<[number, number]>>;
};


// --- NUEVOS TIPOS PARA EL FORMULARIO (lo que el usuario ingresa) ---

// Representa una "boca" o punto de consumo en la instalación.
export type BocaInput = {
  id: string; // ID único para el estado de React
  planta: string; // Etiqueta de la planta donde se ubica (ej: "Planta Baja")
  distancia_desde_anterior_m: number;
  artefacto: {
    catalogId: string; // ID del catálogo (ej: "cocina")
    consumo_kcal_h: number;
  };
  accesorios: {
    codos_90: number;
    codos_45: number;
    tes: number; // Las "T" son importantes en ramales
  };
};

// Este es el objeto completo que representa todos los datos del formulario.
export type CalculoInput = {
  gasId: GasKind;
  pipeSystemId: string;
  plantas: string[];
  bocas: BocaInput[];
};


// --- TIPOS PARA EL MOTOR DE CÁLCULO (lo que la lógica interna usa) ---

// Representa un tramo de cañería entre dos puntos (ej: Nicho-Boca1, Boca1-Boca2).
// El motor de cálculo creará estos tramos a partir de la lista de `BocaInput`.
export type TramoCalculado = {
  id: string; // ID de la boca final del tramo
  label: string; // Etiqueta generada (ej: "Tramo Boca 1 -> Boca 2")
  longitud_m: number;
  accesorios: {
    codos_90: number;
    codos_45: number;
    tes: number;
  };
  // El motor de cálculo determinará el consumo total que pasa por este tramo.
  consumo_total_kcal_h: number; 
  // Distancia total desde el medidor hasta el final de ESTE tramo.
  distancia_acumulada_m: number;
};

// Datos de entrada para la función principal de cálculo, ahora más simple.
export type JobInput = {
  gas: GasOption;
  system: PipeSystem;
  capacity: CapacityTable;
  fittingsEq: FittingsEquivalents;
  tramos: TramoCalculado[];
};

// El resultado para un tramo individual no cambia mucho.
export type TramoResult = {
  id: string;
  label: string;
  caudal_m3h: number;
  distancia_acumulada_m: number;
  longitud_equivalente_m: number;
  diametro_dn: number;
  capacidad_caño_m3h: number;
  utilizacion: number;
  warning?: string;
};

// La lista de materiales (Bill of Materials) es más específica ahora.
export type BomItem =
  | { kind: "pipe"; dn: number; length_m: number }
  | { kind: "fitting"; type: "codo_90" | "codo_45" | "te" | "reduccion"; dn: number; qty: number }
  | { kind: "accessory"; key: string; label: string; qty: number; unit: "u" | "m" };


// --- TIPO DE RESULTADO FINAL (lo que la función de cálculo devuelve) ---
export type ComputeResult = {
  tramoResults: TramoResult[];
  bom: BomItem[];
  total_m3h: number;
  total_kcalh: number;
};
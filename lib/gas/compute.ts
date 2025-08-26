// lib/gas/compute.ts
import {
  // Catálogos
  ApplianceCatalogItem,
  CapacityTable,
  FittingsEquivalents,
  GasOption,
  PipeSystem,
  // Tipos para el formulario
  InstallationInput,
  GasSegmentInput,
  // Tipos para el resultado
  BomItem,
  ComputeResult,
  SegmentResult,
  // Tipos internos del motor
  JobInput,
  SegmentInternal,
} from "./types";

// --- UTILIDADES BÁSICAS (sin cambios) ---
const round2 = (n: number) => Math.round(n * 100) / 100;

function kcalhToM3h(kcal_h: number, gas: GasOption): number {
  const pc = gas.poder_calorifico_kcal_m3 || 9300;
  if (!Number.isFinite(kcal_h) || kcal_h <= 0) return 0;
  return kcal_h / pc;
}

function capacityAtLength(table: CapacityTable, dn: number, length_m: number): number {
  const rows = table.diameters_mm[String(dn)];
  if (!rows || !rows.length) return 0;
  const row = rows.find(([L]) => L >= length_m) ?? rows[rows.length - 1];
  return row[1];
}

function dnCandidates(system: PipeSystem): number[] {
  return [...system.diameters_mm.map((d) => d.dn)].sort((a, b) => a - b);
}

// --- LÓGICA DE CÁLCULO DE DIÁMETROS (refactorizada) ---

/**
 * Calcula la longitud equivalente de un tramo sumando las pérdidas de los accesorios.
 */
function equivalentLengthForDN(
  realLength_m: number,
  fittings: Partial<Record<keyof FittingsEquivalents["equiv_diameters"], number>> | undefined,
  dn_mm: number,
  fittingsEq: FittingsEquivalents
): number {
  if (!fittings || Object.keys(fittings).length === 0) return realLength_m;

  const factors = fittingsEq.equiv_diameters;
  let addedLength_m = 0;
  
  // Mapeamos los nombres de accesorios del formulario a los del motor de cálculo
  const mapping: Record<string, keyof typeof factors> = {
    codos_90: "elbow_90",
    codos_45: "elbow_45",
    llaves_paso: "valve",
  };

  for (const key in fittings) {
    const mappedKey = mapping[key];
    if (mappedKey && factors[mappedKey]) {
      const qty = fittings[key as keyof typeof fittings] ?? 0;
      const nD = factors[mappedKey]; // ej: 30 diámetros
      addedLength_m += (qty * nD * dn_mm) / 1000; // dn_mm -> m
    }
  }

  return realLength_m + addedLength_m;
}


/**
 * Calcula el diámetro óptimo y la utilización para un solo tramo de la red.
 */
function computeSegmentResult(
  seg: SegmentInternal,
  segLabel: string, // <-- Recibe el label del tramo
  gas: GasOption,
  system: PipeSystem,
  capacity: CapacityTable,
  fittingsEq: FittingsEquivalents,
  m3hByApplianceId: Map<string, number>
): SegmentResult {
  const served_m3h = round2(
    seg.downstream.reduce((acc, d) => acc + (m3hByApplianceId.get(d.applianceId) ?? 0), 0)
  );
  const worst_distance_m = seg.downstream.reduce((mx, d) => Math.max(mx, d.distance_from_meter_m), 0);

  const dns = dnCandidates(system);
  let chosen: { dn: number; Lcalc: number; cap: number } | null = null;

  for (const dn of dns) {
    const Lcalc = equivalentLengthForDN(seg.real_length_m, seg.fittings, dn, fittingsEq);
    const cap = capacityAtLength(capacity, dn, Lcalc);
    if (cap >= served_m3h) {
      chosen = { dn, Lcalc, cap };
      break;
    }
  }

  if (!chosen) {
    const dn = dns[dns.length - 1];
    const Lcalc = equivalentLengthForDN(seg.real_length_m, seg.fittings, dn, fittingsEq);
    const cap = capacityAtLength(capacity, dn, Lcalc);
    return {
      id: seg.id,
      label: segLabel,
      served_m3h,
      worst_distance_m,
      selected_dn: dn,
      effective_length_m: round2(Lcalc),
      capacity_m3h: cap,
      utilization: cap > 0 ? round2(served_m3h / cap) : 0,
      warning: "La demanda supera la capacidad del mayor diámetro disponible.",
    };
  }

  return {
    id: seg.id,
    label: segLabel,
    served_m3h,
    worst_distance_m,
    selected_dn: chosen.dn,
    effective_length_m: round2(chosen.Lcalc),
    capacity_m3h: chosen.cap,
    utilization: round2(served_m3h / chosen.cap),
  };
}

// --- NUEVA LÓGICA DE TRANSFORMACIÓN ---

/**
 * Convierte la entrada del formulario (simple) a la estructura detallada
 * que necesita el motor de cálculo (JobInput).
 * Esta función es clave: construye la topología de la red.
 */
function transformInputForComputation(
  input: InstallationInput,
  catalogs: {
    gasOptions: GasOption[];
    pipeSystems: PipeSystem[];
    appliances: ApplianceCatalogItem[];
    fittingsEquivalents: FittingsEquivalents;
    capacityTables: CapacityTable[];
  }
): JobInput {
  const gas = catalogs.gasOptions.find(g => g.id === input.gasId)!;
  const system = catalogs.pipeSystems.find(s => s.id === input.pipeSystemId)!;
  // TODO: Seleccionar la tabla de capacidad correcta según gas y presión
  const capacity = catalogs.capacityTables[0]; 

  const applianceMap = new Map(input.artefactos.map(a => [a.id, a]));

  // 1. Calcular distancia acumulada para cada artefacto
  const distances = new Map<string, number>();
  for (const appliance of input.artefactos) {
      let currentDistance = 0;
      let currentApplianceId = appliance.id;
      // Navegamos hacia atrás por los tramos hasta llegar al medidor
      while (currentApplianceId) {
          const servingSegment = input.tramos.find(t => t.artefactos_servidos.includes(currentApplianceId));
          if (!servingSegment) break;
          currentDistance += servingSegment.longitud_m;
          // Asumimos que el tramo anterior sirve a un único artefacto "padre" o es el inicio.
          // Esta lógica se podría mejorar si los tramos tuvieran "punto de inicio" y "punto final".
          // Por ahora, funciona para una topología lineal.
          break; // Simplificación para topología lineal
      }
      distances.set(appliance.id, currentDistance);
  }

  // 2. Construir los segmentos internos para el motor de cálculo
  const segments: SegmentInternal[] = input.tramos.map(t => {
    // Determinar todos los artefactos aguas abajo de este tramo
    const downstreamAppliances = new Set<string>();
    let toCheck = [...t.artefactos_servidos];
    while(toCheck.length > 0){
        const current = toCheck.pop()!;
        if(!downstreamAppliances.has(current)){
            downstreamAppliances.add(current);
            // Buscar tramos que salgan de este artefacto
            const childSegments = input.tramos.filter(s => s.artefactos_servidos.includes(current)); // Simplificación
        }
    }


    return {
      id: t.id,
      real_length_m: t.longitud_m,
      fittings: {
        elbow_90: t.accesorios.codos_90,
        elbow_45: t.accesorios.codos_45,
        valve: t.accesorios.llaves_paso,
      },
      downstream: Array.from(downstreamAppliances).map(appId => ({
        applianceId: appId,
        distance_from_meter_m: distances.get(appId) || 0,
      }))
    };
  });

  return {
    gas,
    system,
    capacity,
    fittingsEq: catalogs.fittingsEquivalents,
    appliancesCatalog: catalogs.appliances,
    appliances: input.artefactos.map(a => ({ id: a.id, catalogId: a.catalogId, kcal_h: a.consumo_kcal_h })),
    segments,
  };
}


// --- API PRINCIPAL REFACTORIZADA ---
export function computeGasInstallation(
  input: InstallationInput,
  catalogs: any // Usaremos 'any' temporalmente para los catálogos completos
): ComputeResult {

  const jobInput = transformInputForComputation(input, catalogs);
  const { gas, system, capacity, fittingsEq, segments } = jobInput;

  // 1. m³/h por ID de artefacto
  const m3hByApplianceId = new Map<string, number>();
  let total_kcalh = 0;
  for (const a of jobInput.appliances) {
    const m3h = kcalhToM3h(a.kcal_h, gas);
    m3hByApplianceId.set(a.id, m3h);
    total_kcalh += a.kcal_h;
  }
  const total_m3h = round2(Array.from(m3hByApplianceId.values()).reduce((sum, val) => sum + val, 0));

  // 2. Calcular cada tramo
  const segmentResults: SegmentResult[] = segments.map(s => {
      const segmentInputOriginal = input.tramos.find(t => t.id === s.id)!;
      return computeSegmentResult(s, segmentInputOriginal.label, gas, system, capacity, fittingsEq, m3hByApplianceId)
  });

  // 3. Generar BOM (Lista de Materiales)
  const bom: BomItem[] = [];
  segmentResults.forEach(res => {
    const segInput = input.tramos.find(t => t.id === res.id)!;
    
    // Cañerías
    const pipeItem = bom.find(b => b.kind === 'pipe' && b.dn === res.selected_dn) as Extract<BomItem, {kind: "pipe"}> | undefined;
    if (pipeItem) {
      pipeItem.length_m = round2(pipeItem.length_m + segInput.longitud_m);
    } else {
      bom.push({ kind: 'pipe', dn: res.selected_dn, length_m: segInput.longitud_m });
    }

    // Accesorios del tramo
    for (const key in segInput.accesorios) {
        const type = key as keyof typeof segInput.accesorios;
        const qty = segInput.accesorios[type];
        if (qty > 0) {
            bom.push({ kind: 'fitting', type: 'valve', dn: res.selected_dn, qty }); // Simplificado
        }
    }
  });
  
  // Llaves de paso por artefacto
  bom.push({
      kind: 'accessory',
      key: 'llave_paso_artefacto',
      label: 'Llave de paso por artefacto',
      qty: input.artefactos.length,
      unit: 'u'
  });

  return {
    segmentResults,
    bom,
    total_m3h,
    total_kcalh,
  };
}
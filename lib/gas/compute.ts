// lib/gas/compute.ts
import {
  // Catálogos
  CapacityTable,
  FittingsEquivalents,
  GasOption,
  PipeSystem,
  // Tipos para el formulario (NUEVOS)
  CalculoInput,
  // Tipos para el resultado (NUEVOS)
  BomItem,
  ComputeResult,
  TramoResult,
  // Tipos internos del motor (NUEVOS)
  JobInput,
  TramoCalculado,
} from "./types";
import { GasCatalogs } from "../data/catalogs";

// --- UTILIDADES BÁSICAS (sin cambios) ---
const round2 = (n: number) => Math.round(n * 100) / 100;

function kcalhToM3h(kcal_h: number, gas: GasOption): number {
  const pc = gas.poder_calorifico_kcal_m3 || (gas.id === 'natural' ? 9300 : 22000);
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

// --- LÓGICA DE CÁLCULO DE DIÁMETROS (adaptada) ---

/**
 * Calcula la longitud equivalente de un tramo sumando las pérdidas de los accesorios.
 */
function equivalentLengthForDN(
  tramo: TramoCalculado,
  dn_mm: number,
  fittingsEq: FittingsEquivalents
): number {
  const factors = fittingsEq.equiv_diameters;
  let addedLength_m = 0;
  
  const accessoryMap: Partial<Record<keyof typeof factors, number>> = {
    elbow_90: tramo.accesorios.codos_90,
    elbow_45: tramo.accesorios.codos_45,
    tee: tramo.accesorios.tes,
  };

  for (const key in accessoryMap) {
    const typedKey = key as keyof typeof factors;
    if (factors[typedKey]) {
      const qty = accessoryMap[typedKey] ?? 0;
      const nD = factors[typedKey]; // ej: 30 diámetros
      addedLength_m += (qty * nD * dn_mm) / 1000; // dn_mm -> m
    }
  }

  return tramo.longitud_m + addedLength_m;
}

/**
 * Pre-procesa la entrada del formulario para convertir la lista de bocas en una
 * lista de tramos calculables, con consumos y distancias acumuladas.
 * Esta es una de las funciones clave de la nueva lógica.
 */
function transformInputToTramos(input: CalculoInput): TramoCalculado[] {
    const tramos: TramoCalculado[] = [];
    let cumulativeKcalH = 0;
    let cumulativeDistance = 0;

    // Recorremos las bocas desde la más lejana (al final del array) hacia la más cercana
    for (let i = input.bocas.length - 1; i >= 0; i--) {
        const boca = input.bocas[i];
        cumulativeKcalH += boca.artefacto.consumo_kcal_h;
        cumulativeDistance += boca.distancia_desde_anterior_m;

        const label = i > 0 
            ? `Tramo Boca ${i} a Boca ${i+1}`
            : `Tramo Nicho a Boca 1`;

        tramos.unshift({ // Añadimos al principio para mantener el orden original
            id: boca.id,
            label,
            longitud_m: boca.distancia_desde_anterior_m,
            accesorios: boca.accesorios,
            consumo_total_kcal_h: cumulativeKcalH,
            distancia_acumulada_m: cumulativeDistance,
        });
    }
    return tramos;
}

// --- API PRINCIPAL (reescrita completamente) ---

export function computeGasInstallation(
  input: CalculoInput,
  catalogs: GasCatalogs
): ComputeResult {

  // 1. Seleccionar los catálogos correctos
  const gas = catalogs.gasOptions.find(g => g.id === input.gasId)!;
  const system = catalogs.pipeSystems.find(s => s.id === input.pipeSystemId)!;
  const capacity = catalogs.capacityTables.find(t => t.gas === input.gasId)!;
  const fittingsEq = catalogs.fittingsEquivalents;
  const dns = dnCandidates(system);

  // 2. Transformar la entrada de usuario en tramos calculables
  const tramosCalculados = transformInputToTramos(input);
  const total_kcalh = tramosCalculados[0]?.consumo_total_kcal_h || 0;
  const total_m3h = kcalhToM3h(total_kcalh, gas);

  // 3. Calcular el diámetro y resultado para cada tramo
  const tramoResults: TramoResult[] = tramosCalculados.map(tramo => {
    const caudal_m3h = kcalhToM3h(tramo.consumo_total_kcal_h, gas);
    let chosen: { dn: number; Lcalc: number; cap: number } | null = null;

    for (const dn of dns) {
      const Lcalc = equivalentLengthForDN(tramo, dn, fittingsEq);
      const cap = capacityAtLength(capacity, dn, tramo.distancia_acumulada_m); // La capacidad se mira con la distancia total
      if (cap >= caudal_m3h) {
        chosen = { dn, Lcalc, cap };
        break;
      }
    }
    
    // Si no se encontró un diámetro, se usa el más grande y se emite una advertencia
    if (!chosen) {
      const dn = dns[dns.length - 1];
      const Lcalc = equivalentLengthForDN(tramo, dn, fittingsEq);
      const cap = capacityAtLength(capacity, dn, tramo.distancia_acumulada_m);
      return {
        id: tramo.id,
        label: tramo.label,
        caudal_m3h: round2(caudal_m3h),
        distancia_acumulada_m: round2(tramo.distancia_acumulada_m),
        longitud_equivalente_m: round2(Lcalc),
        diametro_dn: dn,
        capacidad_caño_m3h: cap,
        utilizacion: cap > 0 ? round2(caudal_m3h / cap) : 0,
        warning: "La demanda supera la capacidad del mayor diámetro disponible.",
      };
    }

    return {
      id: tramo.id,
      label: tramo.label,
      caudal_m3h: round2(caudal_m3h),
      distancia_acumulada_m: round2(tramo.distancia_acumulada_m),
      longitud_equivalente_m: round2(chosen.Lcalc),
      diametro_dn: chosen.dn,
      capacidad_caño_m3h: chosen.cap,
      utilizacion: round2(caudal_m3h / chosen.cap),
    };
  });

  // 4. Generar la lista de materiales (BOM) a partir de los resultados
  const bom: BomItem[] = [];
  const bomPipeMap = new Map<number, number>(); // dn -> longitud_m

  tramoResults.forEach((res, index) => {
    const tramoOriginal = tramosCalculados[index];
    
    // Cañerías
    const currentLength = bomPipeMap.get(res.diametro_dn) || 0;
    bomPipeMap.set(res.diametro_dn, currentLength + tramoOriginal.longitud_m);

    // Accesorios del tramo (codos, tes)
    if (tramoOriginal.accesorios.codos_90 > 0) {
      bom.push({ kind: 'fitting', type: 'codo_90', dn: res.diametro_dn, qty: tramoOriginal.accesorios.codos_90 });
    }
    if (tramoOriginal.accesorios.codos_45 > 0) {
      bom.push({ kind: 'fitting', type: 'codo_45', dn: res.diametro_dn, qty: tramoOriginal.accesorios.codos_45 });
    }
    if (tramoOriginal.accesorios.tes > 0) {
        bom.push({ kind: 'fitting', type: 'te', dn: res.diametro_dn, qty: tramoOriginal.accesorios.tes });
    }

    // Reducciones (se detectan comparando con el tramo siguiente)
    const nextTramoResult = tramoResults[index + 1];
    if (nextTramoResult && nextTramoResult.diametro_dn < res.diametro_dn) {
        // Asumimos que la reducción se coloca con el diámetro mayor
        bom.push({ kind: 'fitting', type: 'reduccion', dn: res.diametro_dn, qty: 1 });
    }
  });
  
  // Convertir el mapa de cañerías a la lista final del BOM
  for (const [dn, length_m] of bomPipeMap.entries()) {
    bom.unshift({ kind: 'pipe', dn, length_m: round2(length_m) });
  }

  // Llaves de paso por artefacto (una por cada boca)
  bom.push({
      kind: 'accessory',
      key: 'llave_paso_artefacto',
      label: 'Llave de paso por artefacto',
      qty: input.bocas.length,
      unit: 'u'
  });

  return {
    tramoResults,
    bom,
    total_m3h,
    total_kcalh,
  };
}
// lib/gas/compute.ts
import {
  ApplianceCatalogItem,
  ApplianceInstance,
  BomItem,
  CapacityTable,
  ComputeResult,
  FittingsEquivalents,
  GasOption,
  JobInput,
  PipeSystem,
  SegmentFittings,
  SegmentInput,
  SegmentResult,
} from "./types";

// ---------- utilidades básicas ----------
const round2 = (n: number) => Math.round(n * 100) / 100;

function kcalhToM3h(kcal_h: number, gas: GasOption): number {
  const pc = gas.poder_calorifico_kcal_m3 || 9300;
  if (!Number.isFinite(kcal_h) || kcal_h <= 0) return 0;
  return kcal_h / pc;
}

function findApplianceCatalog(
  id: string,
  catalog: ApplianceCatalogItem[]
): ApplianceCatalogItem | undefined {
  return catalog.find((a) => a.id === id);
}

function toM3hForAppliance(
  inst: ApplianceInstance,
  catalog: ApplianceCatalogItem[],
  gas: GasOption
): number {
  const base = findApplianceCatalog(inst.catalogId, catalog);
  const kcal = Number.isFinite(inst.kcal_h ?? NaN)
    ? (inst.kcal_h as number)
    : (base?.default_kcal_h ?? 0);
  const count = Math.max(1, inst.count ?? 1);
  return round2(kcalhToM3h(kcal, gas) * count);
}

// devuelve capacidad (m3/h) para DN en una longitud de cálculo (redondeando hacia arriba)
function capacityAtLength(
  table: CapacityTable,
  dn: number,
  length_m: number
): number {
  const rows = table.diameters_mm[String(dn)];
  if (!rows || rows.length === 0) return 0;
  // encontrar el primer escalón con longitud >= length_m
  const row = rows.find(([L]) => L >= length_m) ?? rows[rows.length - 1];
  return row[1];
}

function pipeInnerMm(system: PipeSystem, dn: number): number | undefined {
  return system.diameters_mm.find((d) => d.dn === dn)?.inner_mm;
}

function dnCandidates(system: PipeSystem): number[] {
  return [...system.diameters_mm.map((d) => d.dn)].sort((a, b) => a - b);
}

function equivalentLengthForDN(
  realLength_m: number,
  fittings: SegmentFittings | undefined,
  dn_mm: number,
  fittingsEq: FittingsEquivalents
): number {
  if (!fittings || Object.keys(fittings).length === 0) return realLength_m;
  const factors = fittingsEq.equiv_diameters;
  let add_m = 0;
  (Object.keys(fittings) as Array<keyof SegmentFittings>).forEach((k) => {
    const qty = fittings[k] ?? 0;
    if (!qty) return;
    const nD = factors[k as keyof typeof factors] ?? 0; // p.ej. 30 diámetros
    add_m += (qty * nD * dn_mm) / 1000; // dn_mm→m
  });
  return realLength_m + add_m;
}

// ---------- núcleo por tramo ----------
function computeSegmentResult(
  seg: SegmentInput,
  gas: GasOption,
  system: PipeSystem,
  capacity: CapacityTable,
  fittingsEq: FittingsEquivalents,
  m3hByApplianceId: Map<string, number>
): SegmentResult {
  const served_m3h = round2(
    seg.downstream.reduce((acc, d) => acc + (m3hByApplianceId.get(d.applianceId) ?? 0), 0)
  );
  const worst_distance_m =
    seg.downstream.reduce((mx, d) => Math.max(mx, d.distance_from_meter_m), 0) || 0;

  // evaluar DN candidatos desde menor a mayor
  const dns = dnCandidates(system);
  let chosen: {
    dn: number;
    Lcalc: number;
    cap: number;
  } | null = null;

  for (const dn of dns) {
    const Lcalc = equivalentLengthForDN(seg.real_length_m, seg.fittings, dn, fittingsEq);
    const cap = capacityAtLength(capacity, dn, Lcalc);
    if (cap >= served_m3h) {
      chosen = { dn, Lcalc, cap };
      break;
    }
  }

  // si ninguno cumple, tomar el mayor DN y avisar
  if (!chosen) {
    const dn = dns[dns.length - 1];
    const Lcalc = equivalentLengthForDN(seg.real_length_m, seg.fittings, dn, fittingsEq);
    const cap = capacityAtLength(capacity, dn, Lcalc);
    return {
      id: seg.id,
      served_m3h,
      worst_distance_m,
      selected_dn: dn,
      effective_length_m: round2(Lcalc),
      capacity_m3h: cap,
      utilization: cap > 0 ? round2(served_m3h / cap) : 0,
      warning: "La demanda supera la capacidad de la tabla para los DN disponibles.",
    };
  }

  return {
    id: seg.id,
    served_m3h,
    worst_distance_m,
    selected_dn: chosen.dn,
    effective_length_m: round2(chosen.Lcalc),
    capacity_m3h: chosen.cap,
    utilization: round2(served_m3h / chosen.cap),
  };
}

// ---------- BOM ----------
function addBomPipe(bom: BomItem[], dn: number, length_m: number) {
  if (length_m <= 0) return;
  const idx = bom.findIndex((b) => b.kind === "pipe" && b.dn === dn);
  if (idx >= 0) {
    (bom[idx] as Extract<BomItem, { kind: "pipe" }>).length_m = round2(
      (bom[idx] as Extract<BomItem, { kind: "pipe" }>).length_m + length_m
    );
  } else {
    bom.push({ kind: "pipe", dn, length_m: round2(length_m) });
  }
}

function addBomFittings(
  bom: BomItem[],
  dn: number,
  fittings: SegmentFittings | undefined
) {
  if (!fittings) return;
  (Object.keys(fittings) as Array<keyof SegmentFittings>).forEach((k) => {
    const qty = fittings[k] ?? 0;
    if (!qty) return;
    // un item por tipo+DN, para inventario claro
    const idx = bom.findIndex(
      (b) => b.kind === "fitting" && b.dn === dn && (b as any).type === k
    );
    if (idx >= 0) {
      (bom[idx] as Extract<BomItem, { kind: "fitting" }>).qty += qty;
    } else {
      bom.push({ kind: "fitting", type: k as any, dn, qty });
    }
  });
}

// ---------- API principal ----------
export function computeNetwork(input: JobInput): ComputeResult {
  const {
    gas,
    system,
    capacity,
    fittingsEq,
    appliancesCatalog,
    appliances,
    segments,
  } = input;

  // 1) m³/h por artefacto
  const m3hByApplianceId = new Map<string, number>();
  for (const a of appliances) {
    m3hByApplianceId.set(a.id, toM3hForAppliance(a, appliancesCatalog, gas));
  }

  // 2) cada tramo → diámetro y verificación
  const results: SegmentResult[] = segments.map((s) =>
    computeSegmentResult(s, gas, system, capacity, fittingsEq, m3hByApplianceId)
  );

  // 3) BOM (metros por DN + accesorios por DN)
  const bom: BomItem[] = [];
  for (const s of segments) {
    const r = results.find((x) => x.id === s.id)!;
    addBomPipe(bom, r.selected_dn, s.real_length_m);
    addBomFittings(bom, r.selected_dn, s.fittings);
  }

  return { segments: results, bom };
}

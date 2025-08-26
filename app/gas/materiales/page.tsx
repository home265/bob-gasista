"use client";
import { useEffect, useMemo, useState } from "react";

type Artefacto = { id: string; etiqueta: string; tipo: string; calorias_h: number; cantidad: number; };
type Tramo = { id: string; nombre: string; largo_m: number; codos: number; tees: number; llaves: number; diametro_mm?: number; };
type Ventilaciones = { ambientes: number; rejillas_altas: number; rejillas_bajas: number; notas: string; ok: boolean; };

const AKEY = "gas.artefactos.v1";
const TKEY = "gas.tramos.v1";
const VKEY = "gas.ventilaciones.v1";
const KCAL_POR_M3 = 9300;
const F_EQ = { codo: 30, tee: 60, llave: 100 };

export default function MaterialesPage() {
  const [artefactos, setArtefactos] = useState<Artefacto[]>([]);
  const [tramos, setTramos] = useState<Tramo[]>([]);
  const [vent, setVent] = useState<Ventilaciones | null>(null);

  useEffect(() => {
    try { setArtefactos(JSON.parse(localStorage.getItem(AKEY)||"[]")); } catch {}
    try { setTramos(JSON.parse(localStorage.getItem(TKEY)||"[]")); } catch {}
    try { setVent(JSON.parse(localStorage.getItem(VKEY)||"null")); } catch {}
  }, []);

  const total_kcal_h = useMemo(
    ()=> artefactos.reduce((a,it)=>a + Math.max(0,it.calorias_h)*Math.max(1,it.cantidad),0),
    [artefactos]
  );
  const total_m3_h = useMemo(()=> +(total_kcal_h / KCAL_POR_M3).toFixed(2), [total_kcal_h]);

  const totalesTramos = useMemo(() => {
    const total_real = tramos.reduce((a,t)=>a+Math.max(0,t.largo_m),0);
    const total_eq = tramos.reduce((a,t)=>{
      const d = (t.diametro_mm ?? 0)/1000;
      const extra = (t.codos|0)*F_EQ.codo*d + (t.tees|0)*F_EQ.tee*d + (t.llaves|0)*F_EQ.llave*d;
      return a + Math.max(0,t.largo_m) + extra;
    },0);
    return { total_real:+total_real.toFixed(2), total_eq:+total_eq.toFixed(2) };
  }, [tramos]);

  // “lista de materiales” muy básica a modo de placeholder
  const materiales = useMemo(() => {
    const lista: { label: string; qty: number; unit: string }[] = [];
    if (totalesTramos.total_real > 0) lista.push({ label: "Cañería (long. real)", qty: +totalesTramos.total_real.toFixed(2), unit: "m" });
    if (totalesTramos.total_eq  > 0) lista.push({ label: "Cañería (long. cálculo)", qty: +totalesTramos.total_eq.toFixed(2), unit: "m" });

    const codos = tramos.reduce((a,t)=>a+(t.codos|0),0);
    const tees = tramos.reduce((a,t)=>a+(t.tees|0),0);
    const llaves = tramos.reduce((a,t)=>a+(t.llaves|0),0);
    if (codos>0)  lista.push({ label: "Codos", qty: codos, unit: "u" });
    if (tees>0)   lista.push({ label: "Tees",  qty: tees, unit: "u" });
    if (llaves>0) lista.push({ label: "Llaves de corte", qty: llaves, unit: "u" });

    if (vent) {
      if (vent.rejillas_altas>0) lista.push({ label: "Rejillas altas", qty: vent.rejillas_altas, unit: "u" });
      if (vent.rejillas_bajas>0) lista.push({ label: "Rejillas bajas", qty: vent.rejillas_bajas, unit: "u" });
    }
    return lista;
  }, [tramos, totalesTramos, vent]);

  function onShare() {
    const lines = [
      `Gas — Resumen`,
      `Demanda total: ${total_m3_h} m³/h`,
      `Tramos (real): ${totalesTramos.total_real} m`,
      `Tramos (cálc.): ${totalesTramos.total_eq} m`,
      `Materiales:`,
      ...materiales.map(m => `• ${m.label}: ${m.qty} ${m.unit}`),
    ];
    const msg = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Materiales / Resumen</h1>

      <div className="card p-4 grid sm:grid-cols-2 gap-3">
        <div className="text-sm">Artefactos: <strong>{artefactos.length}</strong></div>
        <div className="text-sm">kcal/h total: <strong>{total_kcal_h}</strong></div>
        <div className="text-sm">Demanda total: <strong>{total_m3_h} m³/h</strong></div>
        <div className="text-sm">Tramos (real): <strong>{totalesTramos.total_real} m</strong></div>
        <div className="text-sm">Tramos (cálculo): <strong>{totalesTramos.total_eq} m</strong></div>
        <div className="text-sm">Ventilaciones: <strong>{vent?.ok ? "OK" : "Pendiente"}</strong></div>
      </div>

      <div className="card p-4 overflow-x-auto">
        <h2 className="font-medium mb-2">Lista de materiales (borrador)</h2>
        {materiales.length === 0 ? (
          <p className="text-sm text-foreground/60">—</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-foreground/60">
              <tr>
                <th className="text-left py-1">Material</th>
                <th className="text-right py-1">Cantidad</th>
                <th className="text-left py-1">Unidad</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((m, i) => (
                <tr key={`${m.label}-${i}`} className="border-t">
                  <td className="py-1">{m.label}</td>
                  <td className="py-1 text-right">{m.qty}</td>
                  <td className="py-1">{m.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex gap-2">
        <button className="btn" onClick={()=>window.print()}>Imprimir / PDF</button>
        <button className="btn" onClick={onShare}>Compartir</button>
        <a className="btn-secondary" href="/gas/ventilaciones">Volver</a>
      </div>
    </section>
  );
}

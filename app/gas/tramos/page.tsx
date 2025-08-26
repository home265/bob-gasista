"use client";
import { useEffect, useMemo, useState } from "react";

type Tramo = {
  id: string;
  nombre: string;   // "A-C", "C-E", etc.
  largo_m: number;
  codos: number;
  tees: number;
  llaves: number;
  diametro_mm?: number; // opcional
};

const TKEY = "gas.tramos.v1";
const F_EQ = { codo: 30, tee: 60, llave: 100 }; // en diámetros

function load(): Tramo[] {
  try { return JSON.parse(localStorage.getItem(TKEY) || "[]"); } catch { return []; }
}
function save(v: Tramo[]) { localStorage.setItem(TKEY, JSON.stringify(v)); }

function eqLength_m(t: Tramo): number {
  const d = (t.diametro_mm ?? 0) / 1000; // mm → m
  const extra = (t.codos|0)*F_EQ.codo*d + (t.tees|0)*F_EQ.tee*d + (t.llaves|0)*F_EQ.llave*d;
  return +(Math.max(0, t.largo_m) + extra).toFixed(2);
}

export default function TramosPage() {
  const [items, setItems] = useState<Tramo[]>([]);
  const [draft, setDraft] = useState<Tramo>({
    id: "",
    nombre: "A-C",
    largo_m: 3,
    codos: 0,
    tees: 0,
    llaves: 0,
    diametro_mm: undefined,
  });

  useEffect(() => setItems(load()), []);

  const total_real_m = useMemo(() => items.reduce((a,t)=>a+Math.max(0,t.largo_m),0), [items]);
  const total_calc_m = useMemo(() => items.reduce((a,t)=>a+eqLength_m(t),0), [items]);

  function addItem() {
    const it: Tramo = {
      ...draft,
      id: crypto.randomUUID(),
      nombre: draft.nombre.trim() || `Tramo ${items.length+1}`,
      largo_m: Math.max(0, draft.largo_m),
      codos: Math.max(0, draft.codos|0),
      tees: Math.max(0, draft.tees|0),
      llaves: Math.max(0, draft.llaves|0),
      diametro_mm: draft.diametro_mm && draft.diametro_mm > 0 ? draft.diametro_mm : undefined,
    };
    const next = [...items, it];
    setItems(next); save(next);
    setDraft({ ...draft, nombre: `Tramo ${next.length+1}`, largo_m: 3, codos: 0, tees: 0, llaves: 0 });
  }

  function removeItem(id: string) {
    const next = items.filter(i => i.id !== id);
    setItems(next); save(next);
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Tramos</h1>
        <p className="text-sm text-foreground/60">Carga de longitudes reales y accesorios. Si indicás Ø, se aplica longitud equivalente.</p>
      </header>

      <div className="card p-4 space-y-3">
        <div className="grid sm:grid-cols-2 md:grid-cols-6 gap-3">
          <label className="text-sm">
            Tramo
            <input className="w-full px-3 py-2" value={draft.nombre} onChange={(e)=>setDraft({...draft, nombre:e.target.value})}/>
          </label>
          <label className="text-sm">
            Largo (m)
            <input type="number" className="w-full px-3 py-2" value={draft.largo_m} onChange={(e)=>setDraft({...draft, largo_m:+e.target.value||0})} min={0}/>
          </label>
          <label className="text-sm">
            Codos
            <input type="number" className="w-full px-3 py-2" value={draft.codos} onChange={(e)=>setDraft({...draft, codos:+e.target.value||0})} min={0}/>
          </label>
          <label className="text-sm">
            Tees
            <input type="number" className="w-full px-3 py-2" value={draft.tees} onChange={(e)=>setDraft({...draft, tees:+e.target.value||0})} min={0}/>
          </label>
          <label className="text-sm">
            Llaves
            <input type="number" className="w-full px-3 py-2" value={draft.llaves} onChange={(e)=>setDraft({...draft, llaves:+e.target.value||0})} min={0}/>
          </label>
          <label className="text-sm">
            Ø (mm, opcional)
            <input type="number" className="w-full px-3 py-2" value={draft.diametro_mm ?? ""} onChange={(e)=>setDraft({...draft, diametro_mm: e.target.value===""? undefined : (+e.target.value||0)})} min={0}/>
          </label>
        </div>
        <button className="btn" onClick={addItem}>Agregar tramo</button>
      </div>

      <div className="card p-4 space-y-3 overflow-x-auto">
        {items.length === 0 ? (
          <p className="text-sm text-foreground/60">Sin tramos cargados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-foreground/60">
              <tr>
                <th className="text-left py-1">Tramo</th>
                <th className="text-right py-1">L real (m)</th>
                <th className="text-right py-1">C/T/L</th>
                <th className="text-right py-1">Ø (mm)</th>
                <th className="text-right py-1">L cálculo (m)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="py-1">{t.nombre}</td>
                  <td className="py-1 text-right">{t.largo_m.toFixed(2)}</td>
                  <td className="py-1 text-right">{t.codos}/{t.tees}/{t.llaves}</td>
                  <td className="py-1 text-right">{t.diametro_mm ?? "—"}</td>
                  <td className="py-1 text-right">{eqLength_m(t).toFixed(2)}</td>
                  <td className="py-1 text-right">
                    <button className="btn-danger" onClick={()=>removeItem(t.id)}>Quitar</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t font-medium">
                <td className="py-1">Totales</td>
                <td className="py-1 text-right">{total_real_m.toFixed(2)}</td>
                <td colSpan={2}></td>
                <td className="py-1 text-right">{total_calc_m.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <div className="flex gap-2">
        <a className="btn" href="/gas/ventilaciones">Siguiente: Ventilaciones</a>
        <a className="btn-secondary" href="/gas/artefactos">Volver</a>
      </div>
    </section>
  );
}

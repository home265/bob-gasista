"use client";
import { useEffect, useState } from "react";

type Ventilaciones = {
  ambientes: number;     // cantidad de ambientes a ventilar
  rejillas_altas: number;
  rejillas_bajas: number;
  notas: string;
  ok: boolean;
};

const VKEY = "gas.ventilaciones.v1";

function load(): Ventilaciones | null {
  try { return JSON.parse(localStorage.getItem(VKEY) || "null"); } catch { return null; }
}
function save(v: Ventilaciones) { localStorage.setItem(VKEY, JSON.stringify(v)); }

export default function VentilacionesPage() {
  const [form, setForm] = useState<Ventilaciones>({
    ambientes: 1,
    rejillas_altas: 1,
    rejillas_bajas: 1,
    notas: "",
    ok: false,
  });

  useEffect(() => { const prev = load(); if (prev) setForm(prev); }, []);

  function onSave() { save(form); alert("Guardado."); }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Ventilaciones</h1>

      <div className="card p-4 grid sm:grid-cols-2 gap-3">
        <label className="text-sm">
          Ambientes
          <input type="number" className="w-full px-3 py-2" value={form.ambientes} onChange={(e)=>setForm({...form, ambientes:+e.target.value||0})} min={0}/>
        </label>
        <label className="text-sm">
          Rejillas altas (ud)
          <input type="number" className="w-full px-3 py-2" value={form.rejillas_altas} onChange={(e)=>setForm({...form, rejillas_altas:+e.target.value||0})} min={0}/>
        </label>
        <label className="text-sm">
          Rejillas bajas (ud)
          <input type="number" className="w-full px-3 py-2" value={form.rejillas_bajas} onChange={(e)=>setForm({...form, rejillas_bajas:+e.target.value||0})} min={0}/>
        </label>
        <label className="text-sm col-span-2">
          Notas
          <textarea className="w-full px-3 py-2" rows={3} value={form.notas} onChange={(e)=>setForm({...form, notas:e.target.value})}/>
        </label>
        <label className="text-sm inline-flex items-center gap-2 col-span-2">
          <input type="checkbox" checked={form.ok} onChange={(e)=>setForm({...form, ok:e.target.checked})}/>
          Ventilaciones confirmadas ✔
        </label>
      </div>

      <div className="flex gap-2">
        <button className="btn" onClick={onSave}>Guardar</button>
        <a className="btn" href="/gas/materiales">Siguiente: Materiales</a>
        <a className="btn-secondary" href="/gas/tramos">Volver</a>
      </div>
    </section>
  );
}

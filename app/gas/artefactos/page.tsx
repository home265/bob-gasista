"use client";
import { useEffect, useMemo, useState } from "react";

type ArtefactoTipo =
  | "cocina"
  | "calefon"
  | "termotanque"
  | "caldera"
  | "calefactor_tb"
  | "calefactor_tbu"
  | "otro";

type Artefacto = {
  id: string;
  tipo: ArtefactoTipo;
  etiqueta: string;
  calorias_h: number; // kcal/h
  cantidad: number;
};

const AKEY = "gas.artefactos.v1";
const KCAL_POR_M3 = 9300;

const TIPOS: { key: ArtefactoTipo; label: string }[] = [
  { key: "cocina", label: "Cocina" },
  { key: "calefon", label: "Calefón" },
  { key: "termotanque", label: "Termotanque" },
  { key: "caldera", label: "Caldera" },
  { key: "calefactor_tb", label: "Calefactor (tiro balanceado)" },
  { key: "calefactor_tbu", label: "Calefactor (TBU/sin salida)" },
  { key: "otro", label: "Otro" },
];

function load(): Artefacto[] {
  try { return JSON.parse(localStorage.getItem(AKEY) || "[]"); } catch { return []; }
}
function save(v: Artefacto[]) { localStorage.setItem(AKEY, JSON.stringify(v)); }

export default function ArtefactosPage() {
  const [items, setItems] = useState<Artefacto[]>([]);
  const [draft, setDraft] = useState<Artefacto>({
    id: "",
    tipo: "cocina",
    etiqueta: "",
    calorias_h: 10000,
    cantidad: 1,
  });

  useEffect(() => setItems(load()), []);

  const total_kcal_h = useMemo(
    () => items.reduce((a, it) => a + Math.max(0, it.calorias_h) * Math.max(1, it.cantidad), 0),
    [items]
  );
  const total_m3_h = useMemo(() => +(total_kcal_h / KCAL_POR_M3).toFixed(2), [total_kcal_h]);

  function addItem() {
    const etiqueta = draft.etiqueta.trim() || defaultEtiqueta(draft.tipo, items);
    const it: Artefacto = {
      ...draft,
      id: crypto.randomUUID(),
      etiqueta,
      calorias_h: Math.max(0, draft.calorias_h),
      cantidad: Math.max(1, draft.cantidad | 0),
    };
    const next = [...items, it];
    setItems(next); save(next);
    setDraft({ ...draft, etiqueta: "", calorias_h: 10000, cantidad: 1 });
  }

  function removeItem(id: string) {
    const next = items.filter(i => i.id !== id);
    setItems(next); save(next);
  }

  function defaultEtiqueta(tipo: ArtefactoTipo, list: Artefacto[]) {
    const base = TIPOS.find(t => t.key === tipo)?.label ?? "Artefacto";
    const n = list.filter(i => i.tipo === tipo).length + 1;
    return `${base} ${n}`;
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Artefactos</h1>
        <p className="text-sm text-foreground/60">Cargá artefactos y su consumo (kcal/h). Referencia: 9.300 kcal = 1 m³.</p>
      </header>

      <div className="card p-4 space-y-3">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          <label className="text-sm">
            Tipo
            <select
              className="w-full px-3 py-2"
              value={draft.tipo}
              onChange={(e) => setDraft({ ...draft, tipo: e.target.value as ArtefactoTipo })}
            >
              {TIPOS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </label>

          <label className="text-sm">
            Etiqueta
            <input
              className="w-full px-3 py-2"
              value={draft.etiqueta}
              onChange={(e) => setDraft({ ...draft, etiqueta: e.target.value })}
              placeholder="Ej.: Cocina principal"
            />
          </label>

          <label className="text-sm">
            Consumo (kcal/h)
            <input
              type="number"
              className="w-full px-3 py-2"
              value={draft.calorias_h}
              onChange={(e) => setDraft({ ...draft, calorias_h: +e.target.value || 0 })}
              min={0}
            />
          </label>

          <label className="text-sm">
            Cantidad
            <input
              type="number"
              className="w-full px-3 py-2"
              value={draft.cantidad}
              onChange={(e) => setDraft({ ...draft, cantidad: +e.target.value || 1 })}
              min={1}
            />
          </label>
        </div>

        <button className="btn" onClick={addItem}>Agregar</button>
      </div>

      <div className="card p-4 space-y-2">
        <h2 className="font-medium">Listado</h2>
        {items.length === 0 ? (
          <p className="text-sm text-foreground/60">Sin artefactos aún.</p>
        ) : (
          <ul className="space-y-2">
            {items.map(it => (
              <li key={it.id} className="border rounded p-2 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">{it.etiqueta}</div>
                  <div className="text-foreground/60">
                    {it.tipo} · {it.calorias_h} kcal/h × {it.cantidad} → {(it.calorias_h * it.cantidad / KCAL_POR_M3).toFixed(2)} m³/h
                  </div>
                </div>
                <button className="btn-danger" onClick={() => removeItem(it.id)}>Quitar</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-4">
        <div className="text-sm">Total kcal/h: <strong>{total_kcal_h}</strong></div>
        <div className="text-sm">Total m³/h: <strong>{total_m3_h}</strong></div>
      </div>

      <div className="flex gap-2">
        <a className="btn" href="/gas/tramos">Siguiente: Tramos</a>
        <a className="btn-secondary" href="/">Inicio</a>
      </div>
    </section>
  );
}

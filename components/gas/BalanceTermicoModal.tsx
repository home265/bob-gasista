// components/gas/BalanceTermicoModal.tsx
"use client";

import { useState } from "react";
import { calculateBalanceTermico, ZonaClimatica } from "@/lib/calc/balance-termico";

type Props = {
  open: boolean;
  onClose: () => void;
  onCalculate: (kcal_h: number) => void;
  zonas: ZonaClimatica[];
};

export default function BalanceTermicoModal({ open, onClose, onCalculate, zonas }: Props) {
  const [largo, setLargo] = useState(4);
  const [ancho, setAncho] = useState(3);
  const [alto, setAlto] = useState(2.6);
  const [zonaId, setZonaId] = useState(zonas[0]?.id || "");
  const [resultado, setResultado] = useState<number | null>(null);

  if (!open) return null;

  const handleCalculate = () => {
    const kcal_h = calculateBalanceTermico({
      largo_m: largo,
      ancho_m: ancho,
      alto_m: alto,
      zona: zonas.find(z => z.id === zonaId)!,
    });
    setResultado(kcal_h);
  };

  const handleApply = () => {
    if (resultado) {
      onCalculate(resultado);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="card p-6 w-[min(90vw,480px)] space-y-4">
        <h3 className="text-lg font-medium">Ayudante: Balance Térmico</h3>
        <p className="text-sm text-foreground/70">
          Estima las kcal/h necesarias para calefaccionar un ambiente.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm"><span className="font-medium">Largo (m)</span><input type="number" value={largo} onChange={e => setLargo(+e.target.value)} /></label>
          <label className="text-sm"><span className="font-medium">Ancho (m)</span><input type="number" value={ancho} onChange={e => setAncho(+e.target.value)} /></label>
          <label className="text-sm"><span className="font-medium">Alto (m)</span><input type="number" value={alto} onChange={e => setAlto(+e.target.value)} /></label>
        </div>
        <label className="text-sm">
          <span className="font-medium">Zona Climática (según norma IRAM 11603)</span>
          <select value={zonaId} onChange={e => setZonaId(e.target.value)} className="w-full mt-1">
            {zonas.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select>
        </label>

        {resultado && (
          <div className="bg-muted p-3 rounded-lg text-center">
            <p className="text-sm">Se necesitan aprox.</p>
            <p className="text-2xl font-bold">{resultado} <span className="text-lg">kcal/h</span></p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn-secondary" onClick={handleCalculate}>Calcular</button>
          <button type="button" className="btn" onClick={handleApply} disabled={!resultado}>Aplicar al Artefacto</button>
        </div>
      </div>
    </div>
  );
}
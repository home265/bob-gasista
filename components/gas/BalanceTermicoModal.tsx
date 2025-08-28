// components/gas/BalanceTermicoModal.tsx
"use client";

import { useState, useEffect } from "react";
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

  // Reseteamos el resultado cuando el modal se abre para una nueva boca.
  useEffect(() => {
    if (open) {
      setResultado(null);
    }
  }, [open]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="card p-6 w-[min(90vw,480px)] space-y-4">
        <h3 className="text-lg font-medium">Ayudante: Balance Térmico</h3>
        <p className="text-sm text-foreground/70">
          Estima las kcal/h necesarias para calefaccionar un ambiente.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="text-sm flex flex-col gap-1.5"><span className="font-medium">Largo (m)</span><input type="number" value={largo} onChange={e => setLargo(+e.target.value)} /></label>
          <label className="text-sm flex flex-col gap-1.5"><span className="font-medium">Ancho (m)</span><input type="number" value={ancho} onChange={e => setAncho(+e.target.value)} /></label>
          <label className="text-sm flex flex-col gap-1.5"><span className="font-medium">Alto (m)</span><input type="number" value={alto} onChange={e => setAlto(+e.target.value)} /></label>
        </div>
        <label className="text-sm flex flex-col gap-1.5">
          <span className="font-medium">Zona Climática (según norma IRAM 11603)</span>
          <select value={zonaId} onChange={e => setZonaId(e.target.value)} className="w-full mt-1">
            {zonas.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select>
        </label>

        {resultado && (
          <div className="bg-muted p-3 rounded-lg text-center">
            <p className="text-sm">Se necesitan aprox.</p>
            <p className="text-2xl font-bold">{resultado.toLocaleString('es-AR')} <span className="text-lg font-medium text-foreground/80">kcal/h</span></p>
          </div>
        )}

        {/* --- CORRECCIÓN DE BOTONES AQUÍ --- */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCalculate}>
            Calcular
          </button>
          <button type="button" className="btn btn-primary" onClick={handleApply} disabled={!resultado}>
            Aplicar al Artefacto
          </button>
        </div>
      </div>
    </div>
  );
}
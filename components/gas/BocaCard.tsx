"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { GasCatalogs } from "@/lib/data/catalogs";
import React from "react";

type Props = {
  index: number;
  onRemove: () => void;
  // --- AÑADIMOS UNA NUEVA PROP PARA EL BOTÓN ---
  onAdd: () => void;
  onOpenBalanceTermico: (index: number) => void;
  catalogs: GasCatalogs;
};

export default function BocaCard({ index, onRemove, onAdd, onOpenBalanceTermico, catalogs }: Props) {
  const { register, control, setValue } = useFormContext();

  const plantas = useWatch({ control, name: "plantas" });
  const artefactoCatalogId = useWatch({ control, name: `bocas.${index}.artefacto.catalogId` });
  
  const esCalefactor = artefactoCatalogId?.startsWith("calefactor");

  const handleApplianceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newApplianceId = e.target.value;
    
    setValue(`bocas.${index}.artefacto.catalogId`, newApplianceId);
    
    const selectedAppliance = catalogs.appliances.find(a => a.id === newApplianceId);
    
    if (selectedAppliance) {
      setValue(`bocas.${index}.artefacto.consumo_kcal_h`, selectedAppliance.default_kcal_h);
    }

    if (newApplianceId.startsWith("calefactor")) {
      onOpenBalanceTermico(index);
    }
  };

  return (
    <div className="card p-4 space-y-4 relative bg-muted/30">
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-bold text-lg text-foreground/80 pt-1">Boca #{index + 1}</h3>
        {/* --- NUEVO GRUPO DE BOTONES --- */}
        <div className="flex gap-2">
            <button type="button" onClick={onRemove} className="btn btn-danger">
              Eliminar
            </button>
            <button type="button" onClick={onAdd} className="btn btn-secondary">
             + Añadir Siguiente
            </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="text-sm flex flex-col gap-1">
          <span className="font-medium">Ubicación (Planta)</span>
          <select {...register(`bocas.${index}.planta`)} className="w-full px-3 py-2">
             {(plantas || []).map((p: {id: string, nombre: string}) => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
          </select>
        </label>
        <label className="text-sm flex flex-col gap-1">
          <span className="font-medium">
            {index === 0 ? "Dist. Nicho (m)" : `Dist. Boca #${index} (m)`}
          </span>
          <input
            type="number"
            step="0.1"
            {...register(`bocas.${index}.distancia_desde_anterior_m`, { valueAsNumber: true })}
            className="w-full px-3 py-2"
          />
        </label>
        <label className="text-sm flex flex-col gap-1">
            <span className="font-medium">Dirección del Tramo</span>
            <select {...register(`bocas.${index}.direction`)} className="w-full px-3 py-2">
                <option value="adelante">Adelante</option>
                <option value="derecha">Derecha</option>
                <option value="izquierda">Izquierda</option>
                <option value="arriba">Arriba</option>
                <option value="abajo">Abajo</option>
            </select>
        </label>
      </div>
      
      <div className="pt-2 border-t border-border">
         <p className="text-sm font-medium mb-2">Artefacto Conectado</p>
         <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm flex flex-col gap-1">
                <span className="font-medium">Tipo de Artefacto</span>
                <select 
                  className="w-full px-3 py-2"
                  value={artefactoCatalogId}
                  onChange={handleApplianceChange}
                >
                  {catalogs.appliances.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
            </label>
            <div className="flex items-end gap-2">
                <label className="text-sm flex flex-col gap-1 flex-grow">
                    <span className="font-medium">Consumo (kcal/h)</span>
                    <input type="number" {...register(`bocas.${index}.artefacto.consumo_kcal_h`, { valueAsNumber: true })} className="w-full px-3 py-2"/>
                </label>
                {esCalefactor && (
                    <button type="button" onClick={() => onOpenBalanceTermico(index)} className="btn btn-secondary flex-shrink-0" title="Ayudante de Balance Térmico">
                      Calcular
                    </button>
                )}
            </div>
         </div>
      </div>

      <div className="pt-2 border-t border-border">
          <p className="text-sm font-medium mb-2">Accesorios en el tramo hacia esta boca</p>
          <div className="grid grid-cols-3 gap-3">
              <label className="text-xs flex flex-col gap-1">
                  <span>Codos 90°</span>
                  <input type="number" {...register(`bocas.${index}.accesorios.codos_90`, { valueAsNumber: true })} className="w-full px-2 py-1 text-center" />
              </label>
              <label className="text-xs flex flex-col gap-1">
                  <span>Codos 45°</span>
                  <input type="number" {...register(`bocas.${index}.accesorios.codos_45`, { valueAsNumber: true })} className="w-full px-2 py-1 text-center" />
              </label>
              <label className="text-xs flex flex-col gap-1">
                  <span>Conexiones T</span>
                  <input type="number" {...register(`bocas.${index}.accesorios.tes`, { valueAsNumber: true })} className="w-full px-2 py-1 text-center" />
              </label>
          </div>
      </div>
    </div>
  );
}
"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { GasCatalogs } from "@/lib/data/catalogs";
import React from "react";
import HelpPopover from "../ui/HelpPopover";
import NumberWithUnit from "../inputs/NumberWithUnit";

type Props = {
  index: number;
  onRemove: () => void;
  // --- AÑADIMOS UNA NUEVA PROP PARA EL BOTÓN ---
  onAdd: () => void;
  onOpenBalanceTermico: (index: number) => void;
  catalogs: GasCatalogs;
};

export default function BocaCard({ index, onRemove, onAdd, onOpenBalanceTermico, catalogs }: Props) {
  const { register, control, setValue, watch } = useFormContext();

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
          <div className="flex items-center">
            <span className="font-medium">Ubicación (Planta)</span>
            <HelpPopover>
              Selecciona la planta o nivel donde se encuentra esta boca. Sirve para organizar el proyecto.
            </HelpPopover>
          </div>
          <select {...register(`bocas.${index}.planta`)} className="w-full px-3 py-2">
             {(plantas || []).map((p: {id: string, nombre: string}) => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
          </select>
        </label>
        
        <NumberWithUnit
            label={
              <div className="flex items-center">
                <span className="font-medium">
                  {index === 0 ? "Dist. Nicho (m)" : `Dist. Boca #${index} (m)`}
                </span>
                <HelpPopover>
                  Introduce la longitud del caño solo para este tramo (desde la boca anterior o el nicho). No es la distancia acumulada.
                </HelpPopover>
              </div>
            }
            name={`bocas.${index}.distancia_desde_anterior_m`}
            value={watch(`bocas.${index}.distancia_desde_anterior_m`)}
            onChange={newValue => setValue(`bocas.${index}.distancia_desde_anterior_m`, newValue, { shouldValidate: true })}
            step={0.1}
        />

        <label className="text-sm flex flex-col gap-1">
          <div className="flex items-center">
            <span className="font-medium">Dirección del Tramo</span>
            <HelpPopover>
              Indica la dirección del tramo para generar un boceto visual de la instalación en los resultados.
            </HelpPopover>
          </div>
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
              <div className="flex items-center">
                <span className="font-medium">Tipo de Artefacto</span>
                <HelpPopover>
                  Elige el artefacto que se conectará en esta boca. El consumo en kcal/h se actualizará automáticamente.
                </HelpPopover>
              </div>
                <select 
                  className="w-full px-3 py-2"
                  value={artefactoCatalogId}
                  onChange={handleApplianceChange}
                >
                  {catalogs.appliances.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
            </label>
            <div className="flex items-end gap-2">
                <NumberWithUnit
                  label={
                    <div className="flex items-center">
                      <span className="font-medium">Consumo (kcal/h)</span>
                      <HelpPopover>
                        Consumo del artefacto. Si es un calefactor, puedes usar el botón "Calcular" para estimarlo con el ayudante de balance térmico.
                      </HelpPopover>
                    </div>
                  }
                  name={`bocas.${index}.artefacto.consumo_kcal_h`}
                  value={watch(`bocas.${index}.artefacto.consumo_kcal_h`)}
                  onChange={newValue => setValue(`bocas.${index}.artefacto.consumo_kcal_h`, newValue, { shouldValidate: true })}
                />
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
              <NumberWithUnit
                  label={
                    <div className="flex items-center">
                      <span>Codos 90°</span>
                      <HelpPopover>
                        Cantidad de codos de 90° únicamente en este tramo. Cada uno agrega longitud virtual al cálculo.
                      </HelpPopover>
                    </div>
                  }
                  name={`bocas.${index}.accesorios.codos_90`}
                  value={watch(`bocas.${index}.accesorios.codos_90`)}
                  onChange={newValue => setValue(`bocas.${index}.accesorios.codos_90`, newValue, { shouldValidate: true })}
              />
              <NumberWithUnit
                  label={
                    <div className="flex items-center">
                      <span>Codos 45°</span>
                      <HelpPopover>
                        Cantidad de codos de 45° únicamente en este tramo.
                      </HelpPopover>
                    </div>
                  }
                  name={`bocas.${index}.accesorios.codos_45`}
                  value={watch(`bocas.${index}.accesorios.codos_45`)}
                  onChange={newValue => setValue(`bocas.${index}.accesorios.codos_45`, newValue, { shouldValidate: true })}
              />
              <NumberWithUnit
                  label={
                    <div className="flex items-center">
                      <span>Conexiones T</span>
                      <HelpPopover>
                        Cantidad de conexiones "T" utilizadas en este tramo.
                      </HelpPopover>
                    </div>
                  }
                  name={`bocas.${index}.accesorios.tes`}
                  value={watch(`bocas.${index}.accesorios.tes`)}
                  onChange={newValue => setValue(`bocas.${index}.accesorios.tes`, newValue, { shouldValidate: true })}
              />
          </div>
      </div>
    </div>
  );
}
// components/gas/TramosEditor.tsx
"use client";

import { useFieldArray, Control, UseFormRegister, useWatch } from "react-hook-form";
import { InstallationInput } from "@/lib/gas/types";

// Definimos los props que el componente necesita
type Props = {
  control: Control<InstallationInput>;
  register: UseFormRegister<InstallationInput>;
};

export default function TramosEditor({ control, register }: Props) {
  // Hook para manejar la lista dinámica de tramos
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tramos",
  });

  // Observamos la lista de artefactos para poder seleccionarlos en los tramos
  const artefactos = useWatch({
    control,
    name: "artefactos",
  });

  // Función para agregar un nuevo tramo
  const handleAddTramo = () => {
    append({
      id: crypto.randomUUID(),
      label: `Tramo #${fields.length + 1}`,
      longitud_m: 5,
      accesorios: {
        codos_90: 0,
        codos_45: 0,
        llaves_paso: 0,
      },
      artefactos_servidos: [],
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 rounded-lg bg-muted border border-border space-y-3 relative">
            
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Campo: Etiqueta del Tramo */}
              <label className="text-sm flex flex-col gap-1">
                <span className="font-medium">Etiqueta del Tramo</span>
                <input
                  {...register(`tramos.${index}.label`)}
                  className="w-full px-3 py-2"
                  placeholder="Ej: Medidor a Cocina"
                />
              </label>

              {/* Campo: Longitud del Tramo */}
              <label className="text-sm flex flex-col gap-1">
                <span className="font-medium">Longitud (m)</span>
                <input
                  type="number"
                  step="0.1"
                  {...register(`tramos.${index}.longitud_m`, { valueAsNumber: true })}
                  className="w-full px-3 py-2"
                />
              </label>
            </div>
            
            {/* Sub-sección: Accesorios en el tramo */}
            <div>
                <p className="text-sm font-medium mb-1">Accesorios en este tramo</p>
                <div className="grid grid-cols-3 gap-2">
                    <label className="text-xs flex flex-col gap-1">
                        <span>Codos 90°</span>
                        <input type="number" {...register(`tramos.${index}.accesorios.codos_90`, { valueAsNumber: true })} className="w-full px-2 py-1" />
                    </label>
                    <label className="text-xs flex flex-col gap-1">
                        <span>Codos 45°</span>
                        <input type="number" {...register(`tramos.${index}.accesorios.codos_45`, { valueAsNumber: true })} className="w-full px-2 py-1" />
                    </label>
                    <label className="text-xs flex flex-col gap-1">
                        <span>Llaves de Paso</span>
                        <input type="number" {...register(`tramos.${index}.accesorios.llaves_paso`, { valueAsNumber: true })} className="w-full px-2 py-1" />
                    </label>
                </div>
            </div>

            {/* Campo: A qué artefacto se conecta */}
            <label className="text-sm flex flex-col gap-1">
              <span className="font-medium">Artefacto que alimenta al final</span>
              <select
                {...register(`tramos.${index}.artefactos_servidos`)}
                className="w-full px-3 py-2"
                multiple={false} // Aunque el tipo es array, en la UI solo permitimos seleccionar uno para simplificar
              >
                <option value="" disabled>Seleccionar artefacto...</option>
                {artefactos.map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </label>
            
            {/* Botón para eliminar el tramo */}
            <button
              type="button"
              onClick={() => remove(index)}
              className="btn-danger absolute top-2 right-2 px-2 py-1 text-xs"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
      
      {fields.length === 0 && (
         <p className="text-sm text-center text-foreground/60 py-4">
            No hay tramos. Agregá uno para definir la instalación.
        </p>
      )}

      <button
        type="button"
        onClick={handleAddTramo}
        className="btn-secondary"
        disabled={artefactos.length === 0}
      >
        + Agregar Tramo
      </button>
      {artefactos.length === 0 && <p className="text-xs text-yellow-400">Debes agregar al menos un artefacto para poder crear un tramo.</p>}
    </div>
  );
}
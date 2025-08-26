// components/gas/ArtefactosEditor.tsx
"use client";

import { useFieldArray, Control, UseFormRegister } from "react-hook-form";
import { InstallationInput, ApplianceCatalogItem } from "@/lib/gas/types";

// CORRECCIÓN: Añadimos la nueva prop 'onOpenBalanceTermico'
type Props = {
  control: Control<InstallationInput>;
  register: UseFormRegister<InstallationInput>;
  catalogs: {
    appliances: ApplianceCatalogItem[];
  };
  onOpenBalanceTermico: (index: number) => void;
};

export default function ArtefactosEditor({ control, register, catalogs, onOpenBalanceTermico }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "artefactos",
  });

  const handleAddArtefacto = () => {
    const defaultAppliance = catalogs.appliances[0];
    append({
      id: crypto.randomUUID(),
      label: `${defaultAppliance.label} #${fields.length + 1}`,
      catalogId: defaultAppliance.id,
      consumo_kcal_h: defaultAppliance.default_kcal_h,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 rounded-lg bg-muted border border-border space-y-3 relative">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm flex flex-col gap-1">
                <span className="font-medium">Etiqueta</span>
                <input {...register(`artefactos.${index}.label`)} className="w-full px-3 py-2" />
              </label>
              <label className="text-sm flex flex-col gap-1">
                <span className="font-medium">Tipo</span>
                <select {...register(`artefactos.${index}.catalogId`)} className="w-full px-3 py-2">
                  {catalogs.appliances.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </label>
            </div>
            <div className="flex items-end gap-2">
              <label className="text-sm flex flex-col gap-1 flex-grow">
                <span className="font-medium">Consumo (kcal/h)</span>
                <input type="number" {...register(`artefactos.${index}.consumo_kcal_h`, { valueAsNumber: true })} className="w-full px-3 py-2"/>
              </label>
              {/* CORRECCIÓN: Botón para abrir el modal de ayuda */}
              <button type="button" onClick={() => onOpenBalanceTermico(index)} className="btn-secondary flex-shrink-0" title="Calcular con ayudante">?</button>
            </div>
            <button type="button" onClick={() => remove(index)} className="btn-danger absolute top-2 right-2 px-2 py-1 text-xs">Quitar</button>
          </div>
        ))}
      </div>
      {fields.length === 0 && <p className="text-sm text-center text-foreground/60 py-4">No hay artefactos.</p>}
      <button type="button" onClick={handleAddArtefacto} className="btn-secondary">+ Agregar Artefacto</button>
    </div>
  );
}
"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useParams } from "next/navigation";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import ResultTable, { ResultRow } from "@/components/ui/ResultTable";
import AddToProject from "@/components/ui/AddToProject";
import BalanceTermicoModal from "@/components/gas/BalanceTermicoModal";
import BocaCard from "@/components/gas/BocaCard";
import AnotadorExtras from "@/components/gas/AnotadorExtras";

import { GasCatalogs, loadGasCatalogs } from "@/lib/data/catalogs";
import { getProject } from "@/lib/project/storage";
import { MaterialRow } from "@/lib/project/types";
import { ComputeResult, CalculoInput as CalculoInputType } from "@/lib/gas/types"; // Importamos el tipo para el cálculo
import { computeGasInstallation } from "@/lib/gas/compute";

// Esquema de validación para el estado del formulario
const plantaSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, "El nombre es requerido"),
});

const bocaSchema = z.object({
  id: z.string(),
  planta: z.string().min(1, "Requerido"),
  distancia_desde_anterior_m: z.number().min(0.1, "Debe ser > 0"),
  artefacto: z.object({
    catalogId: z.string().min(1, "Seleccione un artefacto"),
    consumo_kcal_h: z.number().min(1, "Debe ser > 0"),
  }),
  accesorios: z.object({
    codos_90: z.number().min(0),
    codos_45: z.number().min(0),
    tes: z.number().min(0),
  }),
});

const formSchema = z.object({
  gasId: z.enum(["natural", "lpg"]),
  pipeSystemId: z.string().min(1, "Seleccione un sistema"),
  plantas: z.array(plantaSchema).min(1, "Debe definir al menos una planta"),
  bocas: z.array(bocaSchema).min(1, "Debe agregar al menos una boca"),
});

type FormInput = z.infer<typeof formSchema>;

function CalculadoraProyecto() {
  const { id: projectId } = useParams<{ id: string }>();
  const project = useMemo(() => getProject(projectId), [projectId]);
  
  const [catalogs, setCatalogs] = useState<GasCatalogs | null>(null);
  const [result, setResult] = useState<ComputeResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBocaIndex, setActiveBocaIndex] = useState<number | null>(null);

  const methods = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gasId: "natural",
      pipeSystemId: "",
      plantas: [{ id: crypto.randomUUID(), nombre: "Planta Baja" }],
      bocas: [],
    },
  });

  const { control, handleSubmit, setValue, watch, register, getValues } = methods;

  const { fields: bocaFields, append: appendBoca, remove: removeBoca } = useFieldArray({
    control, name: "bocas",
  });
  const { fields: plantaFields, append: appendPlanta, remove: removePlanta } = useFieldArray({
    control, name: "plantas",
  });

  const plantas = watch("plantas");

  useEffect(() => {
    loadGasCatalogs().then(data => {
      setCatalogs(data);
      if (data.pipeSystems.length > 0) {
        setValue("pipeSystemId", data.pipeSystems[0].id);
      }
    });
  }, [setValue]);

  const handleAddBoca = () => {
    const lastBoca = bocaFields[bocaFields.length - 1];
    const ultimaPlanta = plantas[plantas.length - 1];
    appendBoca({
      id: crypto.randomUUID(),
      planta: lastBoca?.planta || ultimaPlanta?.nombre || "Planta Baja",
      distancia_desde_anterior_m: 3,
      artefacto: {
        catalogId: catalogs?.appliances[0]?.id || "",
        consumo_kcal_h: catalogs?.appliances[0]?.default_kcal_h || 10000,
      },
      accesorios: { codos_90: 2, codos_45: 0, tes: 0 },
    });
  };
  
  // --- FUNCIÓN ONSUBMIT CORREGIDA ---
  const onSubmit = (data: FormInput) => {
    if (!catalogs) return;

    // Transformamos los datos del formulario al formato que espera el motor de cálculo.
    const datosParaCalcular: CalculoInputType = {
      ...data,
      plantas: data.plantas.map(p => p.nombre), // Convertimos el array de objetos a un array de strings
    };
    
    const calcResult = computeGasInstallation(datosParaCalcular, catalogs);
    setResult(calcResult);
  };
  
  const handleOpenBalanceTermico = (index: number) => {
    setActiveBocaIndex(index);
    setIsModalOpen(true);
  };

  const handleApplyBalanceTermico = (kcal_h: number) => {
    if (activeBocaIndex !== null) {
      setValue(`bocas.${activeBocaIndex}.artefacto.consumo_kcal_h`, kcal_h);
    }
  };

  const { tramoRows, bomRows, itemsForProject } = useMemo(() => {
    if (!result) return { tramoRows: [], bomRows: [], itemsForProject: [] };

    const tramoRows: ResultRow[] = result.tramoResults.map(t => ({
      label: t.label,
      qty: `Ø${t.diametro_dn}mm`,
      unit: `${t.caudal_m3h} m³/h`,
      hint: `L. eq: ${t.longitud_equivalente_m}m`,
    }));
    
    const bomRows: ResultRow[] = result.bom.map(item => {
        switch (item.kind) {
            case 'pipe': return { label: `Cañería Ø${item.dn}mm`, qty: item.length_m, unit: 'm' };
            case 'fitting': return { label: `Accesorio: ${item.type} Ø${item.dn}mm`, qty: item.qty, unit: 'u' };
            case 'accessory': return { label: item.label, qty: item.qty, unit: 'u' };
        }
    });

    const itemsForProject: MaterialRow[] = result.bom.map(item => {
        switch (item.kind) {
            case 'pipe': return { key: `pipe_${item.dn}`, label: `Cañería Ø${item.dn}mm`, qty: item.length_m, unit: 'm' };
            case 'fitting': return { key: `fitting_${item.type}_${item.dn}`, label: `${item.type} Ø${item.dn}mm`, qty: item.qty, unit: 'u' };
            case 'accessory': return { key: item.key, label: item.label, qty: item.qty, unit: 'u' };
        }
    });

    return { tramoRows, bomRows, itemsForProject };
  }, [result]);

  if (!project || !catalogs) return <div className="p-6">Cargando...</div>;

  return (
    <FormProvider {...methods}>
      <section className="space-y-6">
        <div>
           <h1 className="text-2xl font-semibold">Calculadora de Instalación de Gas</h1>
           <p className="text-sm text-foreground/70">Proyecto: {project.name}</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="card p-4 space-y-4">
            <h2 className="font-medium text-lg border-b border-border pb-2">1. Datos Generales</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm flex flex-col gap-1">
                <span className="font-medium">Tipo de Gas</span>
                <select {...register("gasId")} className="w-full px-3 py-2">
                  {catalogs.gasOptions.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </label>
              <label className="text-sm flex flex-col gap-1">
                  <span className="font-medium">Sistema de Cañerías</span>
                  <select {...register("pipeSystemId")} className="w-full px-3 py-2">
                      {catalogs.pipeSystems.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
              </label>
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium">Plantas del Proyecto</label>
              {plantaFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                   <input 
                      {...register(`plantas.${index}.nombre`)}
                      placeholder={`Nombre (Ej: Piso ${index + 1})`}
                      className="w-full px-3 py-2 text-sm"
                   />
                   <button type="button" onClick={() => removePlanta(index)} className="btn-danger flex-shrink-0" disabled={plantaFields.length <= 1}>
                      Quitar
                   </button>
                </div>
              ))}
              <button type="button" onClick={() => appendPlanta({id: crypto.randomUUID(), nombre: `Piso ${plantaFields.length}`})} className="btn-secondary text-sm">
                + Agregar Planta
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-medium text-lg">2. Bocas y Recorrido de la Instalación</h2>
                <button type="button" onClick={handleAddBoca} className="btn-secondary">+ Agregar Boca</button>
            </div>
            <div className="space-y-3">
              {bocaFields.map((field, index) => (
                <BocaCard 
                  key={field.id}
                  index={index}
                  onRemove={() => removeBoca(index)}
                  onOpenBalanceTermico={handleOpenBalanceTermico}
                  catalogs={catalogs}
                />
              ))}
              {bocaFields.length === 0 && (
                <div className="text-center py-8 text-foreground/60 card">
                  Aún no hay bocas. ¡Agrega la primera para empezar!
                </div>
              )}
            </div>
          </div>
          <div className="card p-4 space-y-4">
            <h2 className="font-medium text-lg border-b border-border pb-2">3. Materiales Adicionales (Opcional)</h2>
            <AnotadorExtras />
          </div>
          <div className="flex justify-between items-center pt-4">
            <button type="submit" className="btn btn-primary text-lg px-6 py-3">
              Calcular Instalación
            </button>
          </div>
        </form>

        {result && (
          <div id="resultados" className="space-y-8 pt-6 border-t border-border">
            <h2 className="text-xl font-semibold text-center">Resultados del Cálculo</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <ResultTable title="Diámetros por Tramo" items={tramoRows} />
                <ResultTable title="Cómputo de Materiales" items={bomRows} />
            </div>
            <AddToProject 
                kind="gas_instalacion" 
                defaultTitle={`Cálculo de Gas - ${project.name}`}
                items={itemsForProject}
                raw={{ input: getValues(), result }}
            />
          </div>
        )}

      </section>
      
      <BalanceTermicoModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCalculate={handleApplyBalanceTermico}
        zonas={catalogs.zonasClimaticas}
      />
    </FormProvider>
  );
}

export default function CalculoPage() {
    return <Suspense fallback={<div>Cargando...</div>}><CalculadoraProyecto /></Suspense>;
}
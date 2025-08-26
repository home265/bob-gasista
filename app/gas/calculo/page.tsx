// app/gas/calculo/page.tsx
"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Componentes
import ResultTable, { ResultRow } from "@/components/ui/ResultTable";
import AddToProject from "@/components/ui/AddToProject";
import ArtefactosEditor from "@/components/gas/ArtefactosEditor";
import TramosEditor from "@/components/gas/TramosEditor";
import BalanceTermicoModal from "@/components/gas/BalanceTermicoModal";

// Tipos, catálogos y lógica
import { InstallationInput, ComputeResult, GasKind } from "@/lib/gas/types";
import { MaterialRow } from "@/lib/project/types";
import { GasCatalogs, loadGasCatalogs } from "@/lib/data/catalogs";
import { computeGasInstallation } from "@/lib/gas/compute";
import { ZonaClimatica } from "@/lib/calc/balance-termico";

// Esquema de validación
const formSchema = z.object({
  gasId: z.enum(["natural", "lpg"]),
  pipeSystemId: z.string().min(1, "Seleccioná un sistema"),
  artefactos: z.array(z.object({
      id: z.string(),
      label: z.string().min(1, "La etiqueta es obligatoria"),
      catalogId: z.string().min(1, "Seleccioná un tipo"),
      consumo_kcal_h: z.number().min(1, "Debe ser mayor a 0"),
    })
  ).min(1, "Debes agregar al menos un artefacto."),
  tramos: z.array(z.object({
      id: z.string(),
      label: z.string().min(1, "La etiqueta es obligatoria"),
      longitud_m: z.number().min(0.1, "Debe ser mayor a 0"),
      accesorios: z.object({ codos_90: z.number(), codos_45: z.number(), llaves_paso: z.number() }),
      artefactos_servidos: z.array(z.string()).min(1, "Debes seleccionar un artefacto."),
    })
  ).min(1, "Debes agregar al menos un tramo."),
});


function GasCalculator() {
  const [catalogs, setCatalogs] = useState<GasCatalogs | null>(null);
  const [result, setResult] = useState<ComputeResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeArtefactoIndex, setActiveArtefactoIndex] = useState<number | null>(null);

  const { register, handleSubmit, control, watch, setValue, getValues } = useForm<InstallationInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { artefactos: [], tramos: [] },
  });

  useEffect(() => {
    loadGasCatalogs().then(data => {
        setCatalogs(data);
        setValue("gasId", data.gasOptions[0]?.id || "natural");
        setValue("pipeSystemId", data.pipeSystems[0]?.id || "");
    });
  }, [setValue]);
  
  const onSubmit = (data: InstallationInput) => {
    if (!catalogs) return;
    const calcResult = computeGasInstallation(data, catalogs);
    setResult(calcResult);
  };

  const handleOpenBalanceTermico = (index: number) => {
    setActiveArtefactoIndex(index);
    setIsModalOpen(true);
  };

  const handleApplyBalanceTermico = (kcal_h: number) => {
    if (activeArtefactoIndex !== null) {
      setValue(`artefactos.${activeArtefactoIndex}.consumo_kcal_h`, kcal_h);
    }
  };

  const formValues = watch();

  const { resultRows, bomRows, itemsForProject, defaultTitle } = useMemo((): {
    resultRows: ResultRow[]; bomRows: ResultRow[]; itemsForProject: MaterialRow[]; defaultTitle: string;
  } => {
    const title = `Instalación de Gas (${formValues.artefactos?.length || 0} artef.)`;
    if (!result) return { resultRows: [], bomRows: [], itemsForProject: [], defaultTitle: title };

    const segmentRows: ResultRow[] = result.segmentResults.map(s => ({
      label: s.label, qty: `Ø ${s.selected_dn} mm`, unit: `${s.served_m3h} m³/h`, hint: `L. eq: ${s.effective_length_m}m`,
    }));

    const fittingLabel = (type: string, dn: number) => {
        const labels: Record<string, string> = { "elbow_90": "Codo 90°", "elbow_45": "Codo 45°", "valve": "Llave de Paso" };
        return `${labels[type] || 'Accesorio'} Ø${dn}mm`;
    };

    const billOfMaterialsRows: ResultRow[] = result.bom.map((item) => {
      switch (item.kind) {
        case 'pipe': return { label: `Cañería Ø${item.dn}mm`, qty: item.length_m, unit: 'm' };
        case 'fitting': return { label: fittingLabel(item.type, item.dn), qty: item.qty, unit: 'u' };
        case 'accessory': return { label: item.label, qty: item.qty, unit: item.unit };
      }
    });

    const materialsForProject: MaterialRow[] = result.bom.map(item => {
        switch (item.kind) {
            case 'pipe': return { key: `pipe_${item.dn}`, label: `Cañería Ø${item.dn}mm`, qty: item.length_m, unit: 'm' };
            case 'fitting': return { key: `fitting_${item.type}_${item.dn}`, label: fittingLabel(item.type, item.dn), qty: item.qty, unit: 'u' };
            case 'accessory': return { key: item.key, label: item.label, qty: item.qty, unit: item.unit };
        }
    });

    return { resultRows: segmentRows, bomRows, itemsForProject, defaultTitle: title };
  }, [result, formValues]);
  
  if (!catalogs) return <div className="text-center p-8">Cargando catálogos...</div>;

  return (
    <>
      <BalanceTermicoModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCalculate={handleApplyBalanceTermico}
        zonas={catalogs.zonasClimaticas}
      />
      <section className="space-y-6">
        <h1 className="text-2xl font-semibold">Calculadora Integral de Gas</h1>
        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="card p-4 space-y-4">
              <h2 className="font-medium text-lg border-b border-border pb-2">Datos Generales</h2>
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
            </div>
            <div className="card p-4 space-y-4">
              <h2 className="font-medium text-lg border-b border-border pb-2">Artefactos a Instalar</h2>
              <ArtefactosEditor
                control={control}
                register={register}
                catalogs={catalogs}
                onOpenBalanceTermico={handleOpenBalanceTermico}
              />
            </div>
            <div className="card p-4 space-y-4">
              <h2 className="font-medium text-lg border-b border-border pb-2">Tramos de la Instalación</h2>
              <TramosEditor control={control} register={register} />
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" className="btn">Calcular Instalación</button>
            </div>
          </form>
          <div className="space-y-6">
            <ResultTable title="Diámetros por Tramo" items={resultRows} />
            <ResultTable title="Cómputo de Materiales" items={bomRows} />
          </div>
        </div>
        {result && (
          <AddToProject kind="gas_instalacion" defaultTitle={defaultTitle} items={itemsForProject} raw={{ input: getValues(), result }} />
        )}
      </section>
    </>
  );
}

export default function CalculoGasPage() {
  return <Suspense fallback={<div>Cargando...</div>}><GasCalculator /></Suspense>;
}
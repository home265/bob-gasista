// lib/data/catalogs.ts
import { 
    ApplianceCatalogItem, 
    CapacityTable, 
    FittingsEquivalents, 
    GasOption, 
    PipeSystem 
} from "@/lib/gas/types";
// CORRECCIÓN: Importamos el tipo ZonaClimatica
import { ZonaClimatica } from "@/lib/calc/balance-termico";

// CORRECCIÓN: Añadimos 'zonasClimaticas' a la interfaz
export interface GasCatalogs {
    gasOptions: GasOption[];
    pipeSystems: PipeSystem[];
    appliances: ApplianceCatalogItem[];
    fittingsEquivalents: FittingsEquivalents;
    capacityTables: CapacityTable[];
    zonasClimaticas: ZonaClimatica[];
}

export async function loadGasCatalogs(): Promise<GasCatalogs> {
  const [
    gasOptionsRes,
    pipeSystemsRes,
    appliancesRes,
    fittingsEquivRes,
    naturalGasTableRes,
    lpgTableRes,
    zonasClimaticasRes, // <-- CORRECCIÓN: Añadimos la petición del nuevo JSON
  ] = await Promise.all([
    fetch('/data/gas_options.json'),
    fetch('/data/pipe_systems.json'),
    fetch('/data/appliances.json'),
    fetch('/data/fittings_equiv.json'),
    fetch('/data/capacity_tables/natural_gas_mbar20.json'),
    fetch('/data/capacity_tables/lpg_mbar28.json'),
    fetch('/data/zonas-climaticas.json'), // <-- CORRECCIÓN: Hacemos la petición
  ]);

  const gasOptionsData = await gasOptionsRes.json();

  return {
    gasOptions: gasOptionsData.types,
    pipeSystems: (await pipeSystemsRes.json()).systems,
    appliances: (await appliancesRes.json()).appliances,
    fittingsEquivalents: await fittingsEquivRes.json(),
    capacityTables: [
        await naturalGasTableRes.json(),
        await lpgTableRes.json()
    ],
    zonasClimaticas: await zonasClimaticasRes.json(), // <-- CORRECCIÓN: Añadimos los datos al objeto final
  };
}
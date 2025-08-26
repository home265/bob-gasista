// lib/calc/balance-termico.ts

// Tipo para los datos de las zonas climáticas
export type ZonaClimatica = {
  id: string;
  label: string;
  coeficiente_k: number; // Coeficiente de transmitancia térmica global (K)
};

// Tipo para los datos de entrada de la función de cálculo
export type BalanceTermicoInput = {
  largo_m: number;
  ancho_m: number;
  alto_m: number;
  zona: ZonaClimatica;
};

// Constantes de la fórmula
const TEMP_EXTERIOR_INVIERNO = -4; // Temperatura de diseño exterior (ej. para zona fría)
const TEMP_INTERIOR_CONFORT = 20;  // Temperatura deseada interior
const DELTA_T = TEMP_INTERIOR_CONFORT - TEMP_EXTERIOR_INVIERNO;

/**
 * Calcula el balance térmico de un ambiente de forma simplificada.
 * Fórmula: Q = K * V * ΔT
 * @returns Calorías por hora (kcal/h) necesarias.
 */
export function calculateBalanceTermico(input: BalanceTermicoInput): number {
  if (!input.zona) {
    return 0;
  }

  const volumen_m3 = input.largo_m * input.ancho_m * input.alto_m;
  const calorias_h = input.zona.coeficiente_k * volumen_m3 * DELTA_T;
  
  // Redondeamos a un número entero y razonable
  return Math.ceil(calorias_h / 50) * 50;
}
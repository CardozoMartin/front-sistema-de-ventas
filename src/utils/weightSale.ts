/** Utilidades de venta por peso: todo se guarda y cobra en $/kg y cantidad en kg. */

export function gramsToKg(grams: number): number {
  return Math.round((grams / 1000) * 1000) / 1000;
}

export function kgToGrams(kg: number): number {
  return Math.round(kg * 1000);
}

/** Precio por kg → precio de referencia cada 100 g */
export function pricePer100gFromKg(pricePerKg: number): number {
  return pricePerKg / 10;
}

/** Precio cada 100 g (etiqueta) → precio por kg para el sistema */
export function pricePerKgFrom100g(pricePer100g: number): number {
  return pricePer100g * 10;
}

/** Total a cobrar: kg vendidos × $/kg */
export function saleTotalFromWeight(pricePerKg: number, quantityKg: number): number {
  return Math.round(pricePerKg * quantityKg * 100) / 100;
}

export function formatGramsFromKg(kg: number): string {
  const g = kgToGrams(kg);
  return g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`;
}

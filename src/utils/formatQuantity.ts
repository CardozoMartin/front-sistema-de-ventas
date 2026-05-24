/** Redondea kg a 3 decimales (evita 0.3999999999999999). */
export function roundWeightKg(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 1000) / 1000;
}

/** Muestra kg con hasta 3 decimales, sin basura de punto flotante. */
export function formatWeightKg(value: number): string {
  return roundWeightKg(value).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

export function formatStockDisplay(stock: number, unitType?: string): string {
  if (unitType === "kilogramo") {
    return `${formatWeightKg(stock)} kg`;
  }
  return `${stock} un.`;
}

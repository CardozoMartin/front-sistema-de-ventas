import type { UnitType } from "../services/types";
import { formatWeightKg, roundWeightKg } from "./formatQuantity";

export interface ProductPricingInput {
  price: number;
  costPrice?: number;
  stock?: number;
  unitType?: string;
}

export interface ProductPricingAnalysis {
  unitType: UnitType;
  isWeight: boolean;
  unitLabel: string;
  priceSuffix: string;
  costSuffix: string;
  profitColumnLabel: string;
  saleUnitPrice: number;
  costUnitPrice: number;
  profitPerUnit: number;
  marginPct: number;
  sellsAtLoss: boolean;
  costNormalizedFromStock: boolean;
  hint?: string;
}

/**
 * Productos por kilogramo: precio y costo en $/kg.
 */
export function analyzeProductPricing(
  product: ProductPricingInput
): ProductPricingAnalysis {
  const unitType: UnitType =
    product.unitType === "kilogramo" ? "kilogramo" : "unidad";
  const isWeight = unitType === "kilogramo";
  const saleUnitPrice = product.price;
  const rawCost = product.costPrice ?? 0;
  const stock = roundWeightKg(product.stock ?? 0);

  let costUnitPrice = rawCost;
  let costNormalizedFromStock = false;
  let hint: string | undefined;

  if (isWeight && stock > 0 && rawCost > saleUnitPrice) {
    const costPerKgFromStock = rawCost / stock;
    const looksLikeBatchCost =
      rawCost > saleUnitPrice * 1.5 &&
      costPerKgFromStock <= saleUnitPrice * 1.25 &&
      stock >= 0.5;

    if (looksLikeBatchCost) {
      costUnitPrice = costPerKgFromStock;
      costNormalizedFromStock = true;
      hint = `Costo del lote $${rawCost.toFixed(2)} ÷ ${formatWeightKg(stock)} kg ≈ $${costPerKgFromStock.toFixed(2)}/kg`;
    } else if (rawCost > saleUnitPrice * 1.5) {
      hint =
        stock < 0.5
          ? `El costo $${rawCost.toFixed(2)} parece del lote/tubo entero, no por kg. Con solo ${formatWeightKg(stock)} kg en stock: en Editar producto cargá costo por kg.`
          : `El costo $${rawCost.toFixed(2)}/kg supera el precio $${saleUnitPrice.toFixed(2)}/kg: revisá si cargaste el costo del lote en lugar del costo por kilo.`;
    }
  }

  const profitPerUnit = saleUnitPrice - costUnitPrice;
  const marginPct =
    saleUnitPrice > 0 ? (profitPerUnit / saleUnitPrice) * 100 : 0;

  return {
    unitType,
    isWeight,
    unitLabel: isWeight ? "kg" : "un.",
    priceSuffix: isWeight ? "/ kg" : "/ un.",
    costSuffix: isWeight ? "/ kg" : "/ un.",
    profitColumnLabel: isWeight ? "Ganancia / kg" : "Ganancia / u.",
    saleUnitPrice,
    costUnitPrice,
    profitPerUnit,
    marginPct,
    sellsAtLoss: costUnitPrice > saleUnitPrice,
    costNormalizedFromStock,
    hint,
  };
}

export function normalizeWeightProductCost(
  unitType: string | undefined,
  price: number,
  costPrice: number | undefined,
  stock: number
): number | undefined {
  if (costPrice === undefined || costPrice === null) return costPrice;
  const stockKg = roundWeightKg(stock);
  if (unitType !== "kilogramo" || stockKg <= 0) return costPrice;

  if (costPrice > price * 1.5 && stockKg >= 0.5) {
    const perKg = costPrice / stockKg;
    if (perKg <= price * 1.25) {
      return parseFloat(perKg.toFixed(2));
    }
  }
  return costPrice;
}

import type { Product } from "../services/types";
import type { StockFilterType } from "../components/Producto/StockFilter";

/**
 * Filtra productos basado en el estado del stock (solo productos activos)
 */
export const filterProductsByStock = (
  products: Product[],
  filterType: StockFilterType
): Product[] => {
  // Primero filtramos solo productos activos
  const activeProducts = products.filter(p => p.active !== false);
  
  switch (filterType) {
    case "no-stock":
      return activeProducts.filter(p => p.stock === 0);
    case "low-stock":
      return activeProducts.filter(p => p.stock > 0 && p.stock <= 10);
    case "all":
    default:
      return activeProducts;
  }
};

/**
 * Cuenta los productos por categoría de stock (solo productos activos)
 */
export const countProductsByStock = (products: Product[]) => {
  // Filtrar solo productos activos
  const activeProducts = products.filter(p => p.active !== false);
  
  return {
    total: activeProducts.length,
    noStock: activeProducts.filter(p => p.stock === 0).length,
    lowStock: activeProducts.filter(p => p.stock > 0 && p.stock <= 10).length,
  };
};

import { formatCurrency } from "../../utils/formatCurrency";

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
  profit?: number;
}

interface TopSellingProductsProps {
  products: TopProduct[] | undefined;
}

export const TopSellingProducts = ({ products }: TopSellingProductsProps) => {
  return (
    <div className="app-card p-5 sm:p-6 h-full flex flex-col justify-between">
      <div>
        <h3 className="section-title mb-4 dark:text-neutral-100">Productos más vendidos</h3>
        {products && products.length > 0 ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {products.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-neutral-100 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-150">
                      {product.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {Number(
                        product.quantity % 1 === 0
                          ? product.quantity
                          : product.quantity.toFixed(3)
                      ).toLocaleString("es-AR")}{" "}
                      unidades
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="price-display text-sm dark:text-neutral-100">
                    {formatCurrency(product.revenue)}
                  </p>
                  {product.profit !== undefined && (
                    <p className="text-xs text-neutral-550 dark:text-neutral-450">
                      Ganancia: {formatCurrency(product.profit)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-md bg-neutral-50 py-6 text-center text-sm text-neutral-500 dark:bg-neutral-950 dark:text-neutral-450">
            No hay datos disponibles
          </p>
        )}
      </div>
    </div>
  );
};

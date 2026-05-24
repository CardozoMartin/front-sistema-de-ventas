import { useState } from "react";
import { ShoppingCart, CalendarDays } from "lucide-react";
import { useSales } from "../../hooks/useSales";
import SalesTransactionTable from "../../components/CashRegister/SalesTransactionTable";
import TablePagination from "../../components/ui/TablePagination";
import type { Sale } from "../../services/types";

const BoxHistoryPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 15;
  const { data, isLoading } = useSales(currentPage, limit);
  
  // Extraer las ventas, manejando tanto el formato paginado como el array directo
  const rawSalesList: Sale[] = Array.isArray(data) ? data : (data as any)?.sales || [];
  
  // Calcular total de páginas
  const totalPages = !Array.isArray(data) && (data as any)?.totalPages
    ? (data as any).totalPages
    : Math.ceil(rawSalesList.length / limit);

  // Si el backend mandó todo el array (sin paginar realmente), paginamos localmente
  const salesList = Array.isArray(data) 
    ? rawSalesList.slice((currentPage - 1) * limit, currentPage * limit)
    : rawSalesList;


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sm text-neutral-500">Cargando registro de ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <div className="inline-flex items-center justify-center p-2 bg-neutral-100 text-neutral-900 rounded-md mb-2">
            <ShoppingCart size={20} strokeWidth={1.5} />
          </div>
          <h1 className="page-title">Historial General de Ventas</h1>
          <p className="page-subtitle">Registro completo de todas las transacciones realizadas en la tienda</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-accent-200 bg-accent-50/50 px-4 py-3">
        <CalendarDays className="h-5 w-5 text-accent-700" strokeWidth={1.75} />
        <div>
          <p className="text-sm font-medium text-neutral-900">Bitácora Global</p>
          <p className="text-xs text-neutral-600">
            Mostrando las últimas transacciones registradas.
          </p>
        </div>
      </div>

      {/* Historial de Ventas */}
      <div className="app-card overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 bg-neutral-50/50">
          <h3 className="section-title">Transacciones Recientes</h3>
          <span className="badge-neutral tabular-nums font-semibold">
            {salesList.length} en esta página
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <SalesTransactionTable
            sales={salesList}
            isLoading={isLoading}
          />
        </div>
        {!isLoading && salesList.length > 0 && (
          <div className="border-t border-neutral-200 px-4 py-4 bg-neutral-50/30">
            <TablePagination
              currentPage={currentPage}
              totalPages={Math.max(1, totalPages)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxHistoryPage;

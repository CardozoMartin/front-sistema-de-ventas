import { useState } from "react";
import { X } from "lucide-react";
import { useCashRegisters } from "../hooks";
import { useSalesByCashRegister } from "../hooks/useSales";
import CashRegisterTable from "../components/CashRegister/CashRegisterTable";
import SalesTransactionTable from "../components/CashRegister/SalesTransactionTable";
import type { CashRegister } from "../services";

const BoxHistoryPage = () => {
  const [selectedCashRegister, setSelectedCashRegister] =
    useState<CashRegister | null>(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const { data: cashRegisters, isLoading: loadingCashRegisters } =
    useCashRegisters();
  const { data: sales, isLoading: loadingSales } = useSalesByCashRegister(
    selectedCashRegister?.id || null,
    showSalesModal
  );

  const handleViewDetails = (cashRegister: CashRegister) => {
    setSelectedCashRegister(cashRegister);
    setShowSalesModal(true);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Tabla de Cajas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Historial de Cajas
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {cashRegisters?.length || 0} caja
            {cashRegisters?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="p-4">
          <CashRegisterTable
            cashRegisters={cashRegisters || []}
            isLoading={loadingCashRegisters}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div>

      {/* Modal de Detalles de la Caja */}
      {showSalesModal && selectedCashRegister && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Detalles de la Caja
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Estado: <span 
                    className={`font-semibold ${
                      selectedCashRegister.status === 'abierta' 
                        ? 'text-green-600' 
                        : 'text-gray-600'
                    }`}
                  >
                    {selectedCashRegister.status === 'abierta' ? 'Abierta' : 'Cerrada'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSalesModal(false);
                  setSelectedCashRegister(null);
                }}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Monto Inicial</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ${selectedCashRegister.initialCash.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total Ventas</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedCashRegister.totalSales.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Monto Final</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {selectedCashRegister.finalCash !== undefined && selectedCashRegister.finalCash !== null
                      ? `$${selectedCashRegister.finalCash.toFixed(2)}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Diferencia</p>
                  <p className={`text-2xl font-bold ${
                    Math.abs(selectedCashRegister.difference || 0) < 0.01 
                      ? 'text-green-600' 
                      : selectedCashRegister.difference && selectedCashRegister.difference > 0 
                      ? 'text-blue-600' 
                      : 'text-red-600'
                  }`}>
                    {selectedCashRegister.difference && selectedCashRegister.difference > 0 ? "+" : ""}
                    ${(selectedCashRegister.difference || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Sales Table */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas Registradas</h3>
              <SalesTransactionTable
                sales={sales || []}
                isLoading={loadingSales}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxHistoryPage;

import { useState } from "react";
import { Plus, AlertCircle, DollarSign } from "lucide-react";
import { toast } from "react-hot-toast";
import { useOpenCashRegister, useOpenCashRegisterMutation, useCloseCashRegister } from "../hooks/useCashRegister";
import { useSalesByCashRegister } from "../hooks/useSales";
import OpenCashForm from "../components/CashRegister/OpenCashForm";
import CloseCashForm from "../components/CashRegister/CloseCashForm";
import SalesTransactionTable from "../components/CashRegister/SalesTransactionTable";
import type { CashRegister } from "../services/types";

const CashRegisterPage = () => {
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegister | null>(null);

  // Hooks
  const { data: openCashRegister, isLoading: loadingOpenCash } = useOpenCashRegister();
 
  const { mutate: openCashMutate, isPending: openingCash } = useOpenCashRegisterMutation();
  const { mutate: closeCashMutate, isPending: closingCash } = useCloseCashRegister();
  const { data: sales, isLoading: loadingSales } = useSalesByCashRegister(
    openCashRegister?.id || null,
    true
  );

  // Manejadores
  const handleOpenCash = async (data: { initialCash: number; notes?: string }) => {
    return new Promise<void>((resolve, reject) => {
      openCashMutate(data, {
        onSuccess: () => {
          resolve();
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  };

  const handleCloseCash = async (data: {
    finalCash: number;
    leftForNext: number;
    notes?: string;
  }) => {
    if (!selectedCashRegister) {
      throw new Error("No hay caja seleccionada");
    }

    return new Promise<void>((resolve, reject) => {
      // Enviar el ID del string directamente sin convertir a número
      closeCashMutate(
        {
          id: selectedCashRegister.id,
          data: {
            finalCash: data.finalCash,
            leftForNext: data.leftForNext,
            notes: data.notes,
          },
        },
        {
          onSuccess: () => {
            setSelectedCashRegister(null);
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });
  };

  const handleOpenFormClick = () => {
    if (openCashRegister) {
      toast.error("Ya hay una caja abierta. Ciérrala primero.");
      return;
    }
    setShowOpenForm(true);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign size={32} className="text-blue-600" />
            Gestión de Cajas
          </h1>
          <p className="text-gray-600 mt-1">Abre y cierra cajas registradoras</p>
        </div>
        <button
          onClick={handleOpenFormClick}
          disabled={!!openCashRegister || openingCash}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
        >
          <Plus size={20} />
          Abrir Caja
        </button>
      </div>

      {/* Caja Abierta */}
      {openCashRegister && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-600 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-bold text-green-900">Caja Abierta</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-green-700">Monto Inicial</p>
                    <p className="text-2xl font-bold text-green-900">
                      ${openCashRegister.initialCash.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Ventas en Efectivo</p>
                    <p className="text-2xl font-bold text-green-900">
                      ${openCashRegister.totalCash.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Total Ventas</p>
                    <p className="text-2xl font-bold text-green-900">
                      ${(openCashRegister.totalSales || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Efectivo en Caja</p>
                    <p className="text-2xl font-bold text-green-900">
                      ${(openCashRegister.initialCash + openCashRegister.totalCash).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCashRegister(openCashRegister);
                  setShowCloseForm(true);
                }}
                disabled={closingCash}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 font-medium whitespace-nowrap"
              >
                {closingCash ? "Cerrando..." : "Cerrar Caja"}
              </button>
            </div>
          </div>

          {/* Historial de Ventas */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Historial de Ventas</h2>
              <p className="text-sm text-gray-600 mt-1">
                Ventas registradas en esta caja
              </p>
            </div>
            <div className="p-4">
              <SalesTransactionTable
                sales={sales || []}
                isLoading={loadingSales}
              />
            </div>
          </div>
        </div>
      )}

      {/* Historial de Cajas */}
      {/* <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Historial de Cajas</h2>
          <p className="text-sm text-gray-600 mt-1">
            {cashRegisters?.length || 0} caja{cashRegisters?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="p-4">
          <CashRegisterTable
            cashRegisters={cashRegisters || []}
            isLoading={loadingCashRegisters}
            onViewDetails={handleViewDetails}
          />
        </div>
      </div> */}

      {/* Sin Caja Abierta */}
      {!openCashRegister && !loadingOpenCash && (
        <div className="bg-amber-50 border-l-4 border-amber-600 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900">No hay caja abierta</h3>
              <p className="text-sm text-amber-800">Abre una nueva caja para comenzar a registrar ventas.</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario Abrir Caja */}
      {showOpenForm && (
        <OpenCashForm
          onClose={() => setShowOpenForm(false)}
          onSuccess={() => {
            setShowOpenForm(false);
            toast.success("Caja abierta correctamente");
          }}
          onSubmit={handleOpenCash}
          isLoading={openingCash}
        />
      )}

      {/* Formulario Cerrar Caja */}
      {showCloseForm && selectedCashRegister && (
        <CloseCashForm
          cashRegisterId={selectedCashRegister.id.toString()}
          initialCash={selectedCashRegister.initialCash}
          totalCash={selectedCashRegister.totalCash}
          totalTransfer={selectedCashRegister.totalTransfer}
          totalCuentaCorriente={selectedCashRegister.totalCuentaCorriente}
          onClose={() => {
            setShowCloseForm(false);
            setSelectedCashRegister(null);
          }}
          onSuccess={() => {
            setShowCloseForm(false);
            setSelectedCashRegister(null);
            toast.success("Caja cerrada correctamente");
          }}
          onSubmit={handleCloseCash}
          isLoading={closingCash}
        />
      )}

    </div>
  );
};

export default CashRegisterPage;

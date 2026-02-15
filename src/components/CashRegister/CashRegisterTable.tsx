import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { CashRegister } from "../../services/types";
import { Eye, Edit2 } from "lucide-react";

interface CashRegisterTableProps {
  cashRegisters: CashRegister[];
  isLoading?: boolean;
  onViewDetails?: (cashRegister: CashRegister) => void;
  onEdit?: (cashRegister: CashRegister) => void;
}

const CashRegisterTable = ({
  cashRegisters,
  isLoading = false,
  onViewDetails,
  onEdit,
}: CashRegisterTableProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Cargando cajas...</p>
      </div>
    );
  }

  if (cashRegisters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay cajas registradas</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Apertura
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Monto Inicial
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Monto Final
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Total Ventas
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Diferencia
            </th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {cashRegisters.map((cashRegister) => (
            <tr key={cashRegister.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    cashRegister.status === "abierta"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {cashRegister.status === "abierta" ? "Abierta" : "Cerrada"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {format(new Date(cashRegister.openedAt), "dd/MM/yyyy HH:mm", {
                  locale: es,
                })}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                ${cashRegister.initialCash.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {cashRegister.finalCash !== undefined && cashRegister.finalCash !== null
                  ? `$${cashRegister.finalCash.toFixed(2)}`
                  : "-"}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-green-600">
                ${cashRegister.totalSales.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm">
                {cashRegister.difference !== undefined && cashRegister.difference !== null ? (
                  <span
                    className={
                      Math.abs(cashRegister.difference) < 0.01
                        ? "text-green-600 font-semibold"
                        : cashRegister.difference > 0
                        ? "text-blue-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {cashRegister.difference > 0 ? "+" : ""}
                    ${cashRegister.difference.toFixed(2)}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(cashRegister)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  {onEdit && cashRegister.status === "abierta" && (
                    <button
                      onClick={() => onEdit(cashRegister)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CashRegisterTable;

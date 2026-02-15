import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Sale } from "../../services/types";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface SalesTransactionTableProps {
  sales: Sale[];
  isLoading?: boolean;
}

const SalesTransactionTable = ({
  sales,
  isLoading = false,
}: SalesTransactionTableProps) => {
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Cargando ventas...</p>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay ventas registradas para esta caja</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pagado":
        return "bg-green-100 text-green-800";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      efectivo: "Efectivo",
      transferencia: "Transferencia",
      cuenta_corriente: "Cuenta Corriente",
    };
    return labels[method] || method;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Horario
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Vendedor
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Productos
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Total
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Método Pago
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Estado
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
              Detalles
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50 transition">
              <td className="px-4 py-3 text-sm text-gray-600">
                {format(new Date(sale.createdAt), "HH:mm", {
                  locale: es,
                })}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {typeof sale.seller === "string"
                  ? sale.seller
                  : (sale.seller as any)?.name || "-"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {sale.details && sale.details.length > 0
                  ? `${sale.details.length} product${
                      sale.details.length > 1 ? "s" : ""
                    }`
                  : "-"}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-green-600">
                ${sale.total.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {getPaymentMethodLabel(sale.paymentMethod)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    sale.status
                  )}`}
                >
                  {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {sale.details && sale.details.length > 0 && (
                  <button
                    onClick={() =>
                      setExpandedSaleId(
                        expandedSaleId === sale.id ? null : sale.id
                      )
                    }
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Ver detalles de productos"
                  >
                    {expandedSaleId === sale.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Expanded Details Section */}
      <div className="bg-gray-50">
        {sales.map((sale) => {
          if (expandedSaleId !== sale.id || !sale.details) return null;

          return (
            <div key={`details-${sale.id}`} className="border-b border-gray-200">
              <div className="px-4 py-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Productos en esta venta:
                </h4>
                <div className="space-y-2">
                  {sale.details.map((detail, idx) => (
                    <div
                      key={detail.id || idx}
                      className="flex justify-between items-center bg-white p-3 rounded border border-gray-200"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {detail.productName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {detail.quantity} {detail.unitType === "kilogramo" ? "kg" : "un."}
                          {" "}x ${detail.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        ${detail.subtotal.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalesTransactionTable;

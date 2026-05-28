import { createPortal } from "react-dom";
import { useSalesByClient } from "../../hooks/useSales";
import { formatCurrency } from "../../utils/formatCurrency";
import { X, Calendar, Package, AlertCircle } from "lucide-react";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

interface ClientDebtDetailsModalProps {
  show: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

export const ClientDebtDetailsModal = ({ show, onClose, clientId, clientName }: ClientDebtDetailsModalProps) => {
  const { data: sales, isLoading, error } = useSalesByClient(clientId, show);

  if (!show) return null;

  // Filtrar solo las ventas que fueron a cuenta corriente y que están pendientes
  // o simplemente todas las cuenta corriente (para que vean el historial)
  const debtSales = sales?.filter(s => s.paymentMethod === 'cuenta_corriente') || [];

  const modalContent = (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 sm:p-6">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 sm:p-8 shadow-sm border border-neutral-200/80 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Detalle de Cuenta Corriente</h2>
            <p className="text-sm text-neutral-500 mt-1">Historial de compras al fiado de: <span className="font-medium text-neutral-700">{clientName}</span></p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-md text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto overflow-x-hidden pr-2 flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-sm text-neutral-500">Cargando detalles...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
              Ocurrió un error al cargar los datos. Intente nuevamente.
            </div>
          ) : debtSales.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
              <Package size={32} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-600 font-medium">No hay compras registradas a cuenta corriente.</p>
              <p className="text-sm text-neutral-400 mt-1">Este cliente no ha fiado productos aún.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {debtSales.map(sale => (
                <div key={sale.id} className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
                  {/* Sale Header */}
                  <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Calendar size={16} className="text-neutral-400" />
                      <span className="font-medium">{formatDate(sale.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        sale.status === 'pendiente' ? 'bg-amber-100 text-amber-700' : 
                        sale.status === 'pagado' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {sale.status.toUpperCase()}
                      </span>
                      <span className="font-semibold text-neutral-900">
                        {formatCurrency(sale.total)}
                      </span>
                    </div>
                  </div>

                  {/* Sale Details (Products) */}
                  <div className="p-4">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-neutral-500 uppercase bg-white border-b border-neutral-100">
                        <tr>
                          <th className="pb-2 font-medium">Producto</th>
                          <th className="pb-2 font-medium text-right">Cant.</th>
                          <th className="pb-2 font-medium text-right">Precio Un.</th>
                          <th className="pb-2 font-medium text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-50">
                        {sale.details?.map(detail => (
                          <tr key={detail.id} className="text-neutral-700">
                            <td className="py-2.5 font-medium">{detail.productName}</td>
                            <td className="py-2.5 text-right">{detail.quantity}</td>
                            <td className="py-2.5 text-right">{formatCurrency(detail.unitPrice)}</td>
                            <td className="py-2.5 text-right font-medium text-neutral-900">{formatCurrency(detail.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sale.notes && (
                      <div className="mt-3 flex items-start gap-2 bg-neutral-50 p-2.5 rounded text-xs text-neutral-600">
                        <AlertCircle size={14} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                        <p><span className="font-medium">Nota:</span> {sale.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 pt-5 mt-4 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary py-2 px-6"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

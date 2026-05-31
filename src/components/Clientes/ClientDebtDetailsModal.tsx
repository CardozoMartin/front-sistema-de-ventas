import { createPortal } from "react-dom";
import { useClientStatement } from "../../hooks/useClients";
import { formatCurrency } from "../../utils/formatCurrency";
import { X, Calendar, Package, AlertCircle, Banknote, ShoppingCart, ArrowDownToLine } from "lucide-react";

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
  clientDebt: number;
}

export const ClientDebtDetailsModal = ({ show, onClose, clientId, clientName }: ClientDebtDetailsModalProps) => {
  const { data: statement, isLoading, error } = useClientStatement(clientId, show);

  if (!show) return null;

  const items = statement || [];

  const handleExportPDF = () => {
    // In a real scenario, this would generate a PDF or trigger a print dialog.
    window.print();
  };

  const modalContent = (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 sm:p-6">
      <div className="bg-white rounded-lg max-w-3xl w-full p-4 sm:p-5 shadow-sm border border-neutral-200/80 relative flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Estado de Cuenta (Historial)</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Línea de tiempo de: <span className="font-medium text-neutral-700">{clientName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-md text-neutral-400 hover:text-neutral-700 transition-colors print:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto overflow-x-hidden pr-2 flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-sm text-neutral-500">Cargando estado de cuenta...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
              Ocurrió un error al cargar los datos. Intente nuevamente.
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
              <Package size={32} className="mx-auto text-neutral-300 mb-3" />
              <p className="text-neutral-600 font-medium">No hay movimientos registrados.</p>
              <p className="text-sm text-neutral-400 mt-1">Este cliente no tiene compras a cuenta corriente ni abonos.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-neutral-200 ml-4 md:ml-5 space-y-4 pb-2">
              {(() => {
                // Calculate effective status for all charges (FIFO) to fix old historical records
                const totalPayments = items.filter(i => i.type === 'payment').reduce((sum, i) => sum + i.amount, 0);
                let remainingToApply = totalPayments;

                const processedItems = items.map(item => {
                  if (item.type === 'charge') {
                    const amount = item.amount;
                    let effectiveStatus = item.status;
                    let effectivePaid = item.paidAmount || 0;

                    if (remainingToApply >= amount) {
                      effectiveStatus = 'pagado';
                      effectivePaid = amount;
                      remainingToApply -= amount;
                    } else if (remainingToApply > 0) {
                      effectiveStatus = 'pago_parcial';
                      effectivePaid = remainingToApply;
                      remainingToApply = 0;
                    } else {
                      effectiveStatus = 'pendiente';
                      effectivePaid = 0;
                    }

                    return { ...item, effectiveStatus, effectivePaid };
                  }
                  return { ...item, effectiveStatus: item.status, effectivePaid: 0 };
                });

                return processedItems.map((item) => {
                  const isCharge = item.type === 'charge';
                  const displayStatus = item.effectiveStatus;

                  return (
                    <div key={item.id} className="relative pl-6 md:pl-8">
                      {/* Timeline Marker */}
                      <div className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full flex items-center justify-center border-4 border-white ${isCharge ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                        }`}>
                        {isCharge ? <ShoppingCart size={12} /> : <Banknote size={12} />}
                      </div>

                      <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        {/* Item Header */}
                        <div className={`px-3 py-2 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 ${isCharge ? 'bg-red-50/50' : 'bg-emerald-50/50'
                          }`}>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar size={14} className="text-neutral-500" />
                            <span className="font-semibold text-neutral-700">{formatDate(item.date)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {isCharge && displayStatus && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${displayStatus === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                                  displayStatus === 'pago_parcial' ? 'bg-blue-100 text-blue-700' :
                                    displayStatus === 'pagado' ? 'bg-emerald-100 text-emerald-700' :
                                      'bg-red-100 text-red-700'
                                }`}>
                                {displayStatus === 'pago_parcial' ? 'PAGO PARCIAL' : displayStatus?.toUpperCase()}
                              </span>
                            )}
                            <span className={`font-bold ${isCharge ? 'text-red-600' : 'text-emerald-600'}`}>
                              {isCharge ? '-' : '+'}{formatCurrency(item.amount)}
                            </span>
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="p-3">
                          {isCharge ? (
                            <>
                              <table className="w-full text-xs text-left mb-1">
                                <thead className="text-[10px] text-neutral-500 uppercase bg-white border-b border-neutral-100">
                                  <tr>
                                    <th className="pb-1 font-medium">Producto</th>
                                    <th className="pb-1 font-medium text-right">Cant.</th>
                                    <th className="pb-1 font-medium text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                  {item.details?.map((detail: any) => (
                                    <tr key={detail.id} className="text-neutral-700">
                                      <td className="py-1.5 font-medium">{detail.productName}</td>
                                      <td className="py-1.5 text-right">{detail.quantity}</td>
                                      <td className="py-1.5 text-right font-medium">{formatCurrency(detail.subtotal)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {displayStatus === 'pago_parcial' && (
                                <div className="text-[10px] text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block font-medium">
                                  Abonado a este ticket: {formatCurrency(item.effectivePaid || 0)}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-neutral-600">
                              <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                                Abono recibido en caja
                              </span>
                              {item.notes && <span>({item.notes})</span>}
                            </div>
                          )}

                          {isCharge && item.notes && (
                            <div className="mt-2 flex items-start gap-1.5 bg-neutral-50 p-2 rounded text-[10px] text-neutral-600">
                              <AlertCircle size={12} className="text-neutral-400 mt-0.5 flex-shrink-0" />
                              <p><span className="font-medium">Nota:</span> {item.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Running Balance */}
                        <div className="bg-neutral-800 text-white px-3 py-1.5 text-xs flex justify-between items-center">
                          <span className="text-neutral-300">Saldo luego de este movimiento:</span>
                          <span className="font-mono font-bold tracking-wider">
                            {formatCurrency(Math.abs(item.balance || 0))} {(item.balance || 0) < 0 ? '(Debe)' : '(A favor)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 pt-3 mt-2 shrink-0 flex justify-between items-center print:hidden">
          <button
            onClick={handleExportPDF}
            disabled={items.length === 0}
            className="icon-btn hover:bg-neutral-100 text-neutral-600 gap-1.5 px-3 py-1.5 disabled:opacity-50 flex items-center rounded-lg border border-neutral-200 font-medium text-xs transition-colors"
          >
            <ArrowDownToLine size={14} />
            Imprimir Resumen
          </button>
          <button
            onClick={onClose}
            className="btn-secondary py-1.5 px-4 text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

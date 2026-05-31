import React from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, CreditCard, ShoppingBag } from 'lucide-react';
import { useClients } from '../../hooks/useClients';

interface SellerSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  sales: any[];
}

const formatCurrency = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) return "$0";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const SellerSalesModal: React.FC<SellerSalesModalProps> = ({ isOpen, onClose, sellerName, sales }) => {
  const { data: clientsData } = useClients();
  const clientsList = Array.isArray(clientsData) ? clientsData : (clientsData as any)?.clients || [];

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-neutral-950/40 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl max-h-[95vh] flex flex-col rounded-md bg-white shadow-sm border border-neutral-200 scale-in-center overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-neutral-50/50 border-b border-neutral-200 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
               <ShoppingBag size={20} />
             </div>
             <div>
               <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">Ventas de {sellerName}</h2>
               <p className="text-xs font-medium text-neutral-500 mt-1">Detalle de las operaciones realizadas</p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        
        {/* Body */}
        <div className="overflow-y-auto flex-1 custom-scrollbar relative z-10 bg-white p-6">
          {sales.length > 0 ? (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id || sale._id} className="border border-neutral-200 rounded-lg p-4 hover:border-accent-200 transition-colors bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 font-medium bg-neutral-100 px-2 py-1 rounded w-fit">
                        <Calendar size={12} />
                        {new Date(sale.createdAt).toLocaleString('es-AR')}
                      </span>
                      <span className="text-sm font-medium text-neutral-900 mt-1">
                        {sale.notes === 'ABONO_DE_DEUDA' 
                          ? (sale.details?.[0]?.productName || (sale.client ? "Abono de " + (clientsList.find((c: any) => c.id === sale.client || c._id === sale.client)?.name || 'Cliente') : 'Pago de cuenta corriente'))
                          : `${sale.details?.length || 0} productos vendidos`}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-neutral-900">{formatCurrency(sale.total)}</p>
                      <span className="inline-flex items-center justify-end gap-1 text-xs text-neutral-500 uppercase tracking-wide">
                        <CreditCard size={12} />
                        {sale.paymentMethod}
                      </span>
                    </div>
                  </div>
                  
                  {/* Detalles de productos */}
                  {sale.notes === 'ABONO_DE_DEUDA' ? (
                    <div className="mt-4 border border-neutral-100 rounded-md overflow-hidden bg-neutral-50 p-4 flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5 text-accent-600">
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{sale.details?.[0]?.productName || (sale.client ? "Abono de " + (clientsList.find((c: any) => c.id === sale.client || c._id === sale.client)?.name || 'Cliente') : 'Abono a deuda de cliente')}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Este registro corresponde a un pago de cuenta corriente y no incluye productos físicos.
                        </p>
                      </div>
                    </div>
                  ) : sale.details && sale.details.length > 0 && (
                    <div className="mt-4 border border-neutral-100 rounded-md overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                          <tr>
                            <th className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase">Producto</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase">Cantidad</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase">Precio Unit.</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-neutral-500 uppercase">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {sale.details.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-neutral-50/50">
                              <td className="px-4 py-2 text-sm text-neutral-800">{item.productName || item.product?.name || 'Producto'}</td>
                              <td className="px-4 py-2 text-sm text-neutral-600 text-right">
                                {item.quantity} {item.unitType === 'kilogramo' ? 'kg' : 'un.'}
                              </td>
                              <td className="px-4 py-2 text-sm text-neutral-600 text-right">{formatCurrency(item.unitPrice)}</td>
                              <td className="px-4 py-2 text-sm font-medium text-neutral-800 text-right">{formatCurrency(item.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
              <ShoppingBag size={48} className="mb-4 text-neutral-300" strokeWidth={1} />
              <p className="text-lg font-medium text-neutral-600">No hay ventas registradas</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

import { AlertCircle, Banknote, CreditCard, Users } from "lucide-react";
import { createPortal } from "react-dom";
import type { PaymentMethod } from "../../services/types";
import { formatCurrency } from "../../utils/formatCurrency";

interface PaymentModalProps {
  show: boolean;
  onClose: () => void;
  total: number;
  selectedPaymentMethod: PaymentMethod;
  setSelectedPaymentMethod: (m: PaymentMethod) => void;
  clients: any[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  saleNotes: string;
  setSaleNotes: (notes: string) => void;
  creatingSlot: boolean;
  cartLength: number;
  onConfirmSale: () => void;
}

export const PaymentModal = ({
  show,
  onClose,
  total,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  clients,
  selectedClientId,
  setSelectedClientId,
  saleNotes,
  setSaleNotes,
  creatingSlot,
  cartLength,
  onConfirmSale,
}: PaymentModalProps) => {
  if (!show) return null;

  const hasExceededCredit = () => {
    if (selectedPaymentMethod === 'cuenta_corriente' && selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client && client.maxCredit && client.maxCredit > 0) {
        return (client.debt || 0) + total > client.maxCredit;
      }
    }
    return false;
  };

  const modalContent = (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 sm:p-6">
      <div className="bg-white rounded-lg max-w-xl w-full p-6 sm:p-8 shadow-sm border border-neutral-200/80 relative flex flex-col max-h-[95vh]">

        <h2 className="text-xl font-semibold text-neutral-900 mb-4 sm:mb-6 shrink-0">Finalizar Venta</h2>

        <div className="space-y-5 sm:space-y-6 overflow-y-auto overflow-x-hidden px-1 -mx-1 pb-2 flex-1 custom-scrollbar">
          {/* Total a pagar gigante */}
          <div className="p-5 bg-neutral-50 rounded-md border border-neutral-200 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest">Total a cobrar</p>
            <p className="text-4xl font-semibold text-neutral-950 mt-1">{formatCurrency(total)}</p>
          </div>

          {/* Métodos de pago en Grid (Tarjetas Táctiles) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                { id: 'transferencia', label: 'Transferencia', icon: CreditCard },
                { id: 'cuenta_corriente', label: 'Fiado', icon: Users }
              ].map((method) => {
                const isSelected = selectedPaymentMethod === method.id;
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => {
                      setSelectedPaymentMethod(method.id as PaymentMethod);
                      if (method.id !== 'cuenta_corriente') setSelectedClientId("");
                    }}
                    className={`relative p-4 rounded-md border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm' 
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50/50'
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.5} className={isSelected ? 'text-white' : 'text-neutral-400'} />
                    <span className="font-medium text-xs">
                      {method.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenedor dinámico con altura mínima para evitar saltos */}
          <div className="min-h-[120px] flex flex-col gap-4">
            {/* Selector de Cliente para Cuenta Corriente */}
            {selectedPaymentMethod === 'cuenta_corriente' && (
            <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                Seleccionar Cliente <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="app-input py-2 px-3"
              >
                <option value="">-- Seleccionar Cliente --</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.debt > 0 ? `(Debe: $${client.debt})` : "(Al día)"}
                  </option>
                ))}
              </select>
              {selectedClientId && (
                <div className="mt-3 text-xs">
                  {(() => {
                    const client = clients.find(c => c.id === selectedClientId);
                    if (client && client.maxCredit && client.maxCredit > 0) {
                      const potentialDebt = client.debt + total;
                      const exceeded = potentialDebt > client.maxCredit;
                      return (
                        <p className={`px-3 py-2 rounded font-medium border ${
                          exceeded 
                            ? "text-red-700 bg-red-50 border-red-100" 
                            : "text-neutral-700 bg-white border-neutral-200"
                        }`}>
                          Límite: ${client.maxCredit} | Nueva deuda total: ${potentialDebt}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              value={saleNotes}
              onChange={(e) => setSaleNotes(e.target.value)}
              placeholder="Ej: Dejó seña, entrega a domicilio..."
              className="app-input py-2 px-3 resize-none"
              rows={2}
            />
          </div>

          {/* Advertencia para cuenta corriente */}
          {selectedPaymentMethod === 'cuenta_corriente' && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50/60 border border-amber-200 rounded-md">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Esta venta quedará como <strong className="font-semibold text-amber-950">pendiente</strong> hasta que el cliente registre un pago en su cuenta corriente.
              </p>
            </div>
          )}

          {/* Alerta de crédito excedido */}
          {selectedPaymentMethod === 'cuenta_corriente' && selectedClientId && (() => {
            const client = clients.find(c => c.id === selectedClientId);
            if (client && client.maxCredit && client.maxCredit > 0) {
              const potentialDebt = (client.debt || 0) + total;
              if (potentialDebt > client.maxCredit) {
                return (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50/60 border border-red-200 rounded-md">
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                    <div className="text-xs text-red-800 leading-relaxed">
                      <p className="font-semibold text-red-950">Crédito insuficiente</p>
                      <p className="font-medium mt-0.5">Excede el límite configurado por <strong className="font-semibold text-red-950">{formatCurrency(potentialDebt - client.maxCredit)}</strong></p>
                    </div>
                  </div>
                );
              }
            }
            return null;
          })()}
          </div>
        </div>

        {/* Resumen */}
        <div className="border-t border-neutral-200 pt-4 mt-4 shrink-0 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            Registrando <span className="font-medium text-neutral-700">{cartLength}</span> producto{cartLength !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-3 shrink-0">
          <button
            onClick={() => onClose()}
            disabled={creatingSlot}
            className="btn-secondary flex-1 py-2.5 font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmSale}
            disabled={
              creatingSlot || 
              (selectedPaymentMethod === 'cuenta_corriente' && !selectedClientId) ||
              hasExceededCredit()
            }
            className="btn-primary flex-1 py-2.5 font-medium cursor-pointer"
          >
            {creatingSlot ? "Procesando..." : "Confirmar Venta"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

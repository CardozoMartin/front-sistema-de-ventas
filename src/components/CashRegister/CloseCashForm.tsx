import { useState } from "react";
import { createPortal } from "react-dom";
import { X, AlertCircle, Loader, Calculator } from "lucide-react";
import Swal from "../../utils/swalTheme";
import DenominationCounter from "./DenominationCounter";
import type { DenominationCount } from "../../services/types";

interface CloseCashFormProps {
  cashRegisterId: string;
  initialCash: number;
  totalCash: number;
  totalTransfer: number;
  totalCuentaCorriente: number;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  totalWithdrawals: number;
  totalDeposits: number;
  totalDebtPayments: number;
  onClose: () => void;
  onSuccess?: () => void;
  onSubmit: (data: { cashCounted: number; denominationCount?: DenominationCount; notes?: string }) => Promise<void>;
  isLoading?: boolean;
}

const CloseCashForm = ({
  initialCash,
  totalCash,
  totalTransfer,
  totalCuentaCorriente,
  totalSales,
  totalCost,
  totalProfit,
  totalWithdrawals,
  totalDeposits,
  totalDebtPayments,
  onClose,
  onSuccess,
  onSubmit,
  isLoading = false,
}: CloseCashFormProps) => {
  const [cashCounted, setCashCounted] = useState(0);
  const [denominationCount, setDenominationCount] = useState<DenominationCount>({});
  const [useManualInput, setUseManualInput] = useState(false);
  const [manualCash, setManualCash] = useState('');
  const [notes, setNotes] = useState('');

  // Cálculos
  const expectedCash = initialCash + totalCash + totalDebtPayments - totalWithdrawals + totalDeposits;
  const finalCashValue = useManualInput ? (manualCash ? parseFloat(manualCash) : 0) : cashCounted;
  const difference = finalCashValue - expectedCash;

  const handleDenominationChange = (total: number, denominations: DenominationCount) => {
    setCashCounted(total);
    setDenominationCount(denominations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (finalCashValue < 0) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'El monto contado no puede ser negativo' });
      return;
    }

    try {
      await onSubmit({
        cashCounted: finalCashValue,
        denominationCount: useManualInput ? undefined : (Object.keys(denominationCount).length > 0 ? denominationCount : undefined),
        notes: notes.trim() || undefined,
      });
      Swal.fire({
        icon: 'success',
        title: 'Caja cerrada',
        text: 'Caja cerrada exitosamente',
        timer: 2000,
        showConfirmButton: false,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Error al cerrar caja',
      });
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-lg max-w-4xl w-full shadow-sm border border-slate-100 max-h-[95vh] flex flex-col scale-in-center relative overflow-hidden">
        {/* Glow de fondo decorativo */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-200/40 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-slate-50/80 border-b border-slate-100 shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-rose-500 text-white rounded-md flex items-center justify-center shadow-sm rose-500/30 shrink-0">
              <Calculator size={28} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 tracking-tight leading-none">Arqueo y Cierre de Caja</h2>
              <p className="text-sm font-bold text-slate-500 mt-1.5">Contabiliza el efectivo y finaliza el turno</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isLoading} className="w-10 h-10 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all">
            <X size={24} strokeWidth={1.75} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar relative z-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Resumen de Operaciones */}
            <div>
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-900"></span> Resumen del Turno
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-md p-4 border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fondo Inicial</p>
                  <p className="text-xl font-semibold text-slate-800">${initialCash.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-accent-50 rounded-md p-4 border border-emerald-100">
                  <p className="text-xs font-bold text-accent-700 uppercase tracking-wider mb-1">Ventas Efectivo</p>
                  <p className="text-xl font-semibold text-accent-700">${totalCash.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-neutral-50 rounded-md p-4 border border-neutral-100">
                  <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">Transferencias</p>
                  <p className="text-xl font-semibold text-neutral-800">${totalTransfer.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-violet-50 rounded-md p-4 border border-violet-100">
                  <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Cuenta Corriente</p>
                  <p className="text-xl font-semibold text-violet-700">${totalCuentaCorriente.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                </div>
                {totalDebtPayments > 0 && (
                  <div className="bg-teal-50 rounded-md p-4 border border-teal-100">
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Cobros de Deuda</p>
                    <p className="text-xl font-semibold text-teal-700">+${totalDebtPayments.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
                {totalWithdrawals > 0 && (
                  <div className="bg-rose-50 rounded-md p-4 border border-rose-100">
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Retiros</p>
                    <p className="text-xl font-semibold text-rose-700">-${totalWithdrawals.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
                {totalDeposits > 0 && (
                  <div className="bg-accent-50 rounded-md p-4 border border-emerald-100">
                    <p className="text-xs font-bold text-accent-700 uppercase tracking-wider mb-1">Ingresos</p>
                    <p className="text-xl font-semibold text-accent-700">+${totalDeposits.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Efectivo esperado */}
            <div className="bg-neutral-900 rounded-lg p-6 text-white shadow-sm sky-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-4">
                <div>
                  <p className="text-sm font-bold text-sky-100 uppercase tracking-widest mb-1">Efectivo Esperado en Caja</p>
                  <p className="text-xs font-medium text-sky-200">Fondo + Ventas EF + Cobros deuda − Retiros + Ingresos</p>
                </div>
                <span className="text-4xl md:text-5xl font-semibold">${expectedCash.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Rendimiento */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-neutral-800">Total Ventas</p>
                <p className="text-lg font-bold text-blue-700">${totalSales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-xs text-orange-600">Costo Mercadería</p>
                <p className="text-lg font-bold text-orange-700">${totalCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-accent-50 rounded-lg p-3 border border-emerald-200">
                <p className="text-xs text-accent-700">Ganancia Bruta</p>
                <p className={`text-lg font-bold ${totalProfit < 0 ? 'text-red-700' : 'text-accent-700'}`}>
                  ${totalProfit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Modo de conteo */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-md border border-slate-100">
              <label className="text-sm font-bold text-slate-700">Método de conteo:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setUseManualInput(false); setManualCash(''); }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                    !useManualInput
                      ? 'bg-neutral-100 border-sky-500 text-neutral-800 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Conteo por denominación
                </button>
                <button
                  type="button"
                  onClick={() => setUseManualInput(true)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                    useManualInput
                      ? 'bg-neutral-100 border-sky-500 text-neutral-800 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Monto manual rápido
                </button>
              </div>
            </div>

            {/* Conteo de denominaciones o input manual */}
            {useManualInput ? (
              <div className="bg-neutral-50/50 p-6 rounded-lg border-2 border-neutral-100">
                <label className="block text-base font-semibold text-slate-800 mb-4">¿Cuánto efectivo hay físicamente en la caja? <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold text-3xl">$</span>
                  <input
                    type="number"
                    value={manualCash}
                    onChange={(e) => setManualCash(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-200 rounded-md focus:outline-none focus:ring-4 focus:ring-neutral-500/20 focus:border-sky-500 text-4xl font-semibold text-slate-800 shadow-sm transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <DenominationCounter onChange={handleDenominationChange} />
            )}

            {/* Diferencia */}
            {finalCashValue > 0 && (
              <div
                className={`p-5 rounded-md border-2 flex items-start gap-4 transition-all ${
                  Math.abs(difference) < 0.01
                    ? 'bg-accent-50 border-emerald-300'
                    : difference > 0
                    ? 'bg-neutral-50 border-neutral-300'
                    : 'bg-rose-50 border-rose-300'
                }`}
              >
                <AlertCircle
                  size={28}
                  className={`mt-0.5 flex-shrink-0 ${
                    Math.abs(difference) < 0.01
                      ? 'text-emerald-500'
                      : difference > 0
                      ? 'text-neutral-600'
                      : 'text-rose-500'
                  }`}
                  strokeWidth={1.75}
                />
                <div className="flex-1">
                  <p className={`text-lg font-semibold mb-1 ${
                    Math.abs(difference) < 0.01
                      ? 'text-emerald-800'
                      : difference > 0
                      ? 'text-sky-800'
                      : 'text-rose-800'
                  }`}>
                    {Math.abs(difference) < 0.01
                      ? '¡Cuadre perfecto!'
                      : difference > 0
                      ? `Sobrante: +$${difference.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                      : `Faltante: -$${Math.abs(difference).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                  </p>
                  <p className={`text-sm font-bold ${
                    Math.abs(difference) < 0.01
                      ? 'text-accent-700/80'
                      : difference > 0
                      ? 'text-neutral-800/80'
                      : 'text-rose-600/80'
                  }`}>
                    Esperado: ${expectedCash.toLocaleString('es-AR', { minimumFractionDigits: 2 })} <span className="mx-2 opacity-50">•</span> Contado: ${finalCashValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}

            {/* Notas */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Notas (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones de cierre, sobrantes/faltantes..."
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-md focus:outline-none focus:ring-4 focus:ring-neutral-500/20 focus:border-sky-500 focus:bg-white transition-all resize-none text-sm font-medium text-slate-700"
                rows={2}
                disabled={isLoading}
              />
            </div>
          </form>
        </div>

        {/* Footer buttons - fixed */}
        <div className="flex gap-4 px-8 py-5 border-t border-slate-100 bg-white flex-shrink-0 relative z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-slate-100 text-slate-700 py-3.5 rounded-md font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={isLoading}
            className="flex-1 bg-rose-500 text-white py-3.5 rounded-md font-semibold text-base hover:bg-rose-600 transition-all shadow-sm rose-500/30 hover:shadow-rose-500/40  disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Cerrando...
              </>
            ) : (
              'Confirmar Cierre de Caja'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CloseCashForm;

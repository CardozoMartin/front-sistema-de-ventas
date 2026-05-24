import { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Loader } from 'lucide-react';
import Swal from "../../utils/swalTheme.ts";
import { swalBackdrop, swalCustomClass } from '../../utils/swalTheme';

interface CashMovementModalProps {
  cashRegisterId: string;
  onClose: () => void;
  onSubmit: (data: {
    cashRegisterId: string;
    type: 'retiro' | 'ingreso';
    amount: number;
    reason: string;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const REASON_SUGGESTIONS = [
  'Retiro del dueño',
  'Pago a proveedor',
  'Pago a empleado',
  'Cambio/sencillo',
  'Gastos varios',
  'Fondo de caja',
  'Otro',
];

const CashMovementModal = ({
  cashRegisterId,
  onClose,
  onSubmit,
  isLoading = false,
}: CashMovementModalProps) => {
  const [type, setType] = useState<'retiro' | 'ingreso'>('retiro');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const effectiveReason = reason === 'Otro' ? customReason : reason;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }
    if (!effectiveReason.trim()) {
      newErrors.reason = 'El motivo es obligatorio';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        cashRegisterId,
        type,
        amount: parseFloat(amount),
        reason: effectiveReason.trim(),
        notes: notes.trim() || undefined,
      });
      Swal.fire({
        icon: 'success',
        title: type === 'retiro' ? 'Retiro registrado' : 'Ingreso registrado',
        text: `${type === 'retiro' ? 'Retiro' : 'Ingreso'} de $${parseFloat(amount).toLocaleString('es-AR')} registrado exitosamente`,
        timer: 2000,
        showConfirmButton: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Error al registrar movimiento',
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-800">Movimiento de Efectivo</h2>
          <button onClick={onClose} disabled={isLoading} className="text-gray-500 hover:text-gray-700 p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo de movimiento */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('retiro')}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all border-2 ${
                type === 'retiro'
                  ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <ArrowUpCircle size={20} />
              Retiro
            </button>
            <button
              type="button"
              onClick={() => setType('ingreso')}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all border-2 ${
                type === 'ingreso'
                  ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <ArrowDownCircle size={20} />
              Ingreso
            </button>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monto *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors({ ...errors, amount: '' });
                }}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-lg font-semibold ${
                  errors.amount ? 'border-red-500 focus:ring-red-500/40' : 'border-gray-300 focus:ring-neutral-700/30'
                }`}
                disabled={isLoading}
              />
            </div>
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo *</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {REASON_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setReason(suggestion);
                    if (suggestion !== 'Otro') setCustomReason('');
                    if (errors.reason) setErrors({ ...errors, reason: '' });
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    reason === suggestion
                      ? type === 'retiro'
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            {reason === 'Otro' && (
              <input
                type="text"
                value={customReason}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  if (errors.reason) setErrors({ ...errors, reason: '' });
                }}
                placeholder="Especifique el motivo..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-700/30"
                disabled={isLoading}
              />
            )}
            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar observaciones adicionales..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-700/30 resize-none"
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* Info box */}
          <div className={`p-3 rounded-lg border ${
            type === 'retiro' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}>
            <p className={`text-xs ${type === 'retiro' ? 'text-red-800' : 'text-green-800'}`}>
              {type === 'retiro'
                ? '⚠️ El retiro se descontará del efectivo esperado al cierre de caja.'
                : 'ℹ️ El ingreso se sumará al efectivo esperado al cierre de caja.'}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 text-white py-2.5 rounded-lg font-medium transition disabled:bg-gray-400 flex items-center justify-center gap-2 ${
                type === 'retiro' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                `Registrar ${type === 'retiro' ? 'Retiro' : 'Ingreso'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CashMovementModal;

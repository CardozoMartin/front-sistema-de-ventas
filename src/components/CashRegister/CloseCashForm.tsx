import { useState } from "react";
import { X, DollarSign, AlertCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

interface CloseCashFormProps {
  cashRegisterId: string;
  initialCash: number;
  totalCash: number;
  totalTransfer: number;
  totalCuentaCorriente: number;
  onClose: () => void;
  onSuccess?: () => void;
  onSubmit: (data: { finalCash: number; leftForNext: number; notes?: string }) => Promise<void>;
  isLoading?: boolean;
}

const CloseCashForm = ({
  initialCash,
  totalCash,
  totalTransfer,
  totalCuentaCorriente,
  onClose,
  onSuccess,
  onSubmit,
  isLoading = false,
}: CloseCashFormProps) => {
  const [finalCash, setFinalCash] = useState("");
  const [leftForNext, setLeftForNext] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Cálculos
  const expectedCash = initialCash + totalCash;
  const finalCashNum = finalCash ? parseFloat(finalCash) : 0;
  const difference = finalCashNum - expectedCash;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    const newErrors: { [key: string]: string } = {};

    if (!finalCash || parseFloat(finalCash) < 0) {
      newErrors.finalCash = "El monto final debe ser un número positivo";
    }

    if (!leftForNext || parseFloat(leftForNext) < 0) {
      newErrors.leftForNext = "El monto para la próxima caja deben ser positivo";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        finalCash: parseFloat(finalCash),
        leftForNext: parseFloat(leftForNext),
        notes: notes.trim() || undefined,
      });
      toast.success("Caja cerrada exitosamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cerrar caja");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign size={24} className="text-red-600" />
            Cerrar Caja
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resumen de Operaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div>
              <p className="text-xs text-gray-600">Monto Inicial</p>
              <p className="text-lg font-semibold">${initialCash.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Ventas en Efectivo</p>
              <p className="text-lg font-semibold text-green-600">${totalCash.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Transferencias</p>
              <p className="text-lg font-semibold text-blue-600">${totalTransfer.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Cuenta Corriente</p>
              <p className="text-lg font-semibold text-purple-600">${totalCuentaCorriente.toFixed(2)}</p>
            </div>
            <div className="md:col-span-2 border-t pt-3 mt-2">
              <p className="text-xs text-gray-600">Efectivo Esperado</p>
              <p className="text-xl font-bold text-blue-900">${expectedCash.toFixed(2)}</p>
            </div>
          </div>

          {/* Monto Final */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Final en Caja (Contado) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={finalCash}
                onChange={(e) => {
                  setFinalCash(e.target.value);
                  if (errors.finalCash) {
                    setErrors({ ...errors, finalCash: "" });
                  }
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.finalCash
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                disabled={isLoading}
              />
            </div>
            {errors.finalCash && (
              <p className="text-red-500 text-sm mt-1">{errors.finalCash}</p>
            )}
          </div>

          {/* Diferencia */}
          {finalCashNum > 0 && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                Math.abs(difference) < 0.01
                  ? "bg-green-50 border-green-200"
                  : difference > 0
                  ? "bg-blue-50 border-blue-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <AlertCircle
                size={20}
                className={`mt-0.5 flex-shrink-0 ${
                  Math.abs(difference) < 0.01
                    ? "text-green-600"
                    : difference > 0
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {Math.abs(difference) < 0.01
                    ? "✓ Cuadre perfecto"
                    : difference > 0
                    ? `Diferencia: +$${difference.toFixed(2)} (Sobrante)`
                    : `Diferencia: -$${Math.abs(difference).toFixed(2)} (Faltante)`}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Esperado: ${expectedCash.toFixed(2)} | Contado: ${finalCashNum.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Monto para Próxima Caja */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto para Próxima Caja *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={leftForNext}
                onChange={(e) => {
                  setLeftForNext(e.target.value);
                  if (errors.leftForNext) {
                    setErrors({ ...errors, leftForNext: "" });
                  }
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.leftForNext
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                disabled={isLoading}
              />
            </div>
            {errors.leftForNext && (
              <p className="text-red-500 text-sm mt-1">{errors.leftForNext}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Este monto se usará como monto inicial de la próxima caja
            </p>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar observaciones sobre el cierre de caja..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Información */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              ℹ️ Verifica que el monto final coincida con lo que hay físicamente en la caja. Se registrará la hora de cierre.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Cerrando...
                </>
              ) : (
                "Cerrar Caja"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloseCashForm;

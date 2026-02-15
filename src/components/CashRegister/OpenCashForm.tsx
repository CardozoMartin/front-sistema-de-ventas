import { useState } from "react";
import { DollarSign, Loader, X } from "lucide-react";
import toast from "react-hot-toast";

interface OpenCashFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  onSubmit: (data: { initialCash: number; notes?: string }) => Promise<void>;
  isLoading?: boolean;
}

const OpenCashForm = ({ 
  onClose, 
  onSuccess, 
  onSubmit, 
  isLoading = false 
}: OpenCashFormProps) => {
  const [initialCash, setInitialCash] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación
    const newErrors: { [key: string]: string } = {};
    
    if (!initialCash || parseFloat(initialCash) < 0) {
      newErrors.initialCash = "El monto inicial debe ser un número positivo";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        initialCash: parseFloat(initialCash),
        notes: notes.trim() || undefined,
      });
      toast.success("Caja abierta exitosamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al abrir caja");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign size={24} className="text-blue-600" />
            Abrir Caja
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Monto Inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Inicial *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={initialCash}
                onChange={(e) => {
                  setInitialCash(e.target.value);
                  if (errors.initialCash) {
                    setErrors({ ...errors, initialCash: "" });
                  }
                }}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.initialCash
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                disabled={isLoading}
              />
            </div>
            {errors.initialCash && (
              <p className="text-red-500 text-sm mt-1">{errors.initialCash}</p>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar observaciones sobre la apertura de caja..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Información */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              ℹ️ Al abrir la caja, este será el monto base. Se registrará la hora de apertura.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
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
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Abriendo...
                </>
              ) : (
                "Abrir Caja"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpenCashForm;

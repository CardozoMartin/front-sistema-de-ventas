import { useState } from "react";
import { createPortal } from "react-dom";
import { Loader, X, Wallet, Info, AlertCircle } from "lucide-react";
import Swal from "../../utils/swalTheme";

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
    
    const parsedCash = initialCash === '' ? 0 : parseFloat(initialCash);
    if (isNaN(parsedCash) || parsedCash < 0) {
      newErrors.initialCash = "El monto inicial debe ser un número positivo o 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        initialCash: initialCash === '' ? 0 : parseFloat(initialCash),
        notes: notes.trim() || undefined,
      });
      Swal.fire({
        icon: 'success',
        title: 'Caja abierta',
        text: 'Caja abierta exitosamente',
        timer: 2000,
        showConfirmButton: false,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : "Error al abrir caja",
      });
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-lg max-w-md w-full p-6 sm:p-8 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col scale-in-center">
        {/* Glow de fondo decorativo */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-neutral-50 text-neutral-800 rounded-md flex items-center justify-center border border-neutral-100 shadow-sm">
              <Wallet size={24} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Abrir Caja</h2>
              <p className="text-xs font-bold text-slate-500 mt-0.5">Inicia un nuevo turno</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-10 h-10 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Monto Inicial */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Fondo Inicial
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold text-lg">
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
                className={`w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 rounded-md focus:outline-none focus:ring-4 focus:bg-white transition-all font-semibold text-lg text-slate-800 ${
                  errors.initialCash
                    ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-100 focus:ring-neutral-500/20 focus:border-sky-500"
                }`}
                disabled={isLoading}
              />
            </div>
            {errors.initialCash && (
              <p className="text-rose-500 font-bold text-xs mt-2 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.initialCash}
              </p>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Cambio en monedas, billetes chicos..."
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-md focus:outline-none focus:ring-4 focus:ring-neutral-500/20 focus:border-sky-500 focus:bg-white transition-all resize-none text-sm font-medium text-slate-700"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Información */}
          <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-md flex gap-3 items-start">
            <Info size={20} className="text-neutral-600 shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-xs font-medium text-sky-800 leading-relaxed">
              Ingresá el monto base de dinero en efectivo con el que vas a empezar este turno. Si no hay dinero en la caja, ingresá <strong className="font-semibold">0</strong>.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-slate-100 text-slate-700 py-3.5 rounded-md font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-neutral-900 text-white py-3.5 rounded-md font-semibold text-base hover:bg-neutral-800 transition-all shadow-sm sky-500/30 hover:shadow-sky-500/40  disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:translate-y-0 flex items-center justify-center gap-2"
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

  return createPortal(modalContent, document.body);
};

export default OpenCashForm;

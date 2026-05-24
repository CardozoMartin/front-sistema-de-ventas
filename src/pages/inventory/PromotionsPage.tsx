import { useNavigate } from "react-router-dom";
import { usePromotions } from "../../hooks/usePromotions";
import { Zap, Plus } from "lucide-react";
import TablePromotion from "../../components/Promociones/TablePromotion";

const PromotionsPage = () => {
  const navigate = useNavigate();
  const page = 1;
  const limit = 10;

  const { data: promotionsData, isLoading, error } = usePromotions({ page, limit });
  const promotions = promotionsData?.promotions || [];

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-4">
        <div>
          <div className="inline-flex items-center justify-center p-2 bg-primary-100 text-primary-600 rounded-md mb-2">
            <Zap size={28} strokeWidth={1.75} />
          </div>
          <h2 className="text-3xl font-semibold text-slate-800 tracking-tight">
            Gestión de Promociones
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Configura ofertas y packs especiales</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/dashboard/promociones/agregar")}
            className="flex items-center justify-center w-full sm:w-auto gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-md hover:bg-slate-800  hover:shadow-lg transition-all duration-300 font-bold text-sm"
          >
            <Plus size={20} strokeWidth={1.75} />
            Agregar Promoción
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
          <p className="text-red-600">
            Error al cargar promociones: {(error as any).message}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8 flex flex-col">
        <p className="text-slate-500 mb-5 font-medium text-sm">
          Lista completa de promociones disponibles.
        </p>

        <div className="w-full bg-slate-50/50 rounded-md border border-slate-100 overflow-x-auto">
          <TablePromotion
            promotions={promotions}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;

import { useNavigate } from "react-router-dom";
import { usePromotions } from "../hooks/usePromotions";
import TablePromotion from "../components/Promociones/TablePromotion";

const PromotionsPage = () => {
  const navigate = useNavigate();
  const page = 1;
  const limit = 10;

  const { data: promotionsData, isLoading, error } = usePromotions({ page, limit });
  const promotions = promotionsData?.promotions || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Promociones
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard/promociones/agregar")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
          >
            + Agregar Promoción
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

      <div className="bg-white border border-gray-500/30 rounded-md p-6">
        <p className="text-gray-600 mb-3 font-bold">
          Lista completa de promociones disponibles.
        </p>

        <div className="w-full p-4 bg-white border border-gray-500/30 rounded-md">
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

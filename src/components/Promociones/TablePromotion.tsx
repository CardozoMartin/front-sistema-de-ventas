import { Edit2, Trash2, Eye, Lock, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useDeletePromotion, useDeactivatePromotion } from "../../hooks/usePromotions";
import type { Promotion } from "../../services/promotions.service";

interface TablePromotionProps {
  promotions: Promotion[];
  isLoading: boolean;
}

const TablePromotion = ({
  promotions,
  isLoading,
}: TablePromotionProps) => {
  const navigate = useNavigate();
  const { mutate: deletePromotion } = useDeletePromotion();
  const { mutate: deactivatePromotion } = useDeactivatePromotion();

  const handleEdit = (promotion: Promotion) => {
    navigate(`/dashboard/promociones/editar/${promotion.id}`, {
      state: { promotion },
    });
  };

  const handleDelete = (promotion: Promotion) => {
    Swal.fire({
      title: "¿Eliminar promoción?",
      text: `¿Estás seguro de que deseas eliminar "${promotion.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deletePromotion(promotion.id, {
          onSuccess: () => {
            Swal.fire({
              icon: "success",
              title: "Promoción eliminada",
              text: "La promoción ha sido eliminada exitosamente",
            });
          },
          onError: (error: any) => {
            Swal.fire({
              icon: "error",
              title: "Error",
              text:
                error?.response?.data?.message ||
                "No se pudo eliminar la promoción",
            });
          },
        });
      }
    });
  };

  const handleToggleActive = (promotion: Promotion) => {
    const action = promotion.active ? "desactivar" : "activar";
    Swal.fire({
      title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} promoción?`,
      text: `¿Deseas ${action} "${promotion.name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        if (!promotion.active) {
          // Para activar, hacer PUT con active: true
          // Aquí usaríamos updatePromotion
          // Por ahora solo mostrar mensaje
          Swal.fire({
            icon: "info",
            title: "Función en desarrollo",
            text: "La activación de promociones está en desarrollo",
          });
        } else {
          deactivatePromotion(promotion.id, {
            onSuccess: () => {
              Swal.fire({
                icon: "success",
                title: "Promoción desactivada",
                text: "La promoción ha sido desactivada exitosamente",
              });
            },
            onError: (error: any) => {
              Swal.fire({
                icon: "error",
                title: "Error",
                text:
                  error?.response?.data?.message ||
                  "No se pudo desactivar la promoción",
              });
            },
          });
        }
      }
    });
  };

  const handleView = (promotion: Promotion) => {
    navigate(`/dashboard/promociones/${promotion.id}`, {
      state: { promotion },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse flex flex-col gap-4 w-full">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No hay promociones disponibles</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Nombre
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Tipo
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">
              Productos
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">
              Precio
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">
              Descuento
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">
              Stock
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">
              Estado
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promotion) => (
            <tr
              key={promotion.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3 text-gray-800 font-medium">
                {promotion.name}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                    promotion.type === "bundle"
                      ? "bg-blue-100 text-blue-800"
                      : promotion.type === "quantity"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {promotion.type}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-gray-700">
                {promotion.items.length}
              </td>
              <td className="px-4 py-3 text-right text-gray-800 font-semibold">
                ${promotion.promoPrice.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-end justify-end gap-1">
                  <span className="text-green-600 font-semibold">
                    ${promotion.savings.toLocaleString()}
                  </span>
                  <span className="text-xs text-green-600">
                    ({promotion.discountPercentage}%)
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-center text-gray-700">
                {promotion.stock !== undefined && promotion.stock !== null ? (
                  <span
                    className={`font-semibold ${
                      promotion.stock === 0
                        ? "text-red-600"
                        : promotion.stock < 10
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {promotion.stock}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                    promotion.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {promotion.active ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => handleView(promotion)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(promotion)}
                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(promotion)}
                    className={`p-1.5 rounded transition ${
                      promotion.active
                        ? "text-orange-600 hover:bg-orange-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={
                      promotion.active ? "Desactivar" : "Activar"
                    }
                  >
                    {promotion.active ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(promotion)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablePromotion;

/**
 * Tabla de productos con paginación - recibe props desde ProductosPage
 */

import { Edit, Trash2, Power, PowerOff, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useDeleteProduct, useDeactivateProduct } from "../../hooks";
import type { Product } from "../../services/types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface TableProductProps {
  productos: { products: Product[]; pagination: Pagination } | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const TableProduct = ({
  productos,
  isLoading,
  currentPage,
  onPageChange,
}: TableProductProps) => {
  const navigate = useNavigate();
  const deleteProduct = useDeleteProduct();
  const deactivateProduct = useDeactivateProduct();

  const products = productos?.products ?? [];
  const pagination = productos?.pagination;

  const handleEditClick = (product: Product) => {
    Swal.fire({
      title: `¿Editar ${product.name}?`,
      text: "Serás redirigido al formulario de edición",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, editar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/dashboard/productos/agregar", { state: { product } });
      }
    });
  };

  const handleDeleteClick = (id: string, name: string) => {
    Swal.fire({
      title: `¿Eliminar ${name}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProduct.mutate(id, {
          onSuccess: () => {
            Swal.fire("Eliminado", "El producto ha sido eliminado", "success");
          },
          onError: (error: any) => {
            Swal.fire(
              "Error",
              error.response?.data?.message || "Error al eliminar el producto",
              "error"
            );
          },
        });
      }
    });
  };

  const handleToggleStatus = (id: string, isActive: boolean, name: string) => {
    Swal.fire({
      title: `¿${isActive ? "Desactivar" : "Activar"} ${name}?`,
      text: `El producto será ${isActive ? "desactivado" : "activado"}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${isActive ? "desactivar" : "activar"}`,
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deactivateProduct.mutate(id, {
          onSuccess: () => {
            Swal.fire(
              "Actualizado",
              `El producto ha sido ${isActive ? "desactivado" : "activado"}`,
              "success"
            );
          },
          onError: (error: any) => {
            Swal.fire(
              "Error",
              error.response?.data?.message || "Error al cambiar el estado",
              "error"
            );
          },
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
        <p className="text-gray-600 text-lg">No hay productos registrados</p>
        <p className="text-gray-500 text-sm mt-2">
          Comienza agregando tu primer producto
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">ID</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Categoría</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Precio</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Costo</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Unidad</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Estado</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                {product.id}
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  {product.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {product.category}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-800">
                ${product.price.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right text-gray-600">
                ${(product.costPrice ?? 0).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    product.stock > 10
                      ? "bg-green-100 text-green-700"
                      : product.stock > 0
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.stock}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-gray-600 text-xs capitalize">
                {product.unitType || "N/A"}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    product.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {product.active ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleEditClick(product)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleToggleStatus(product.id, product.active, product.name)
                    }
                    className={`p-1.5 rounded transition ${
                      product.active
                        ? "text-orange-600 hover:bg-orange-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={product.active ? "Desactivar" : "Activar"}
                  >
                    {product.active ? (
                      <PowerOff className="w-4 h-4" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product.id, product.name)}
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

      {/* Footer con totales y paginación */}
      <div className="mt-0 px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-md flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-600">
          Mostrando{" "}
          <span className="font-semibold">{products.length}</span> de{" "}
          <span className="font-semibold">{pagination?.total ?? products.length}</span>{" "}
          productos
        </p>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 text-sm rounded-md transition font-medium ${
                    p === currentPage
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= pagination.pages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableProduct;
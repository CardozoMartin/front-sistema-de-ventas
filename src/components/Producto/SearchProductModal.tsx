/**
 * Modal de búsqueda de productos
 * Adaptado para TanStack Query
 */

import { useState } from "react";
import { Search, X, Edit, Power, PowerOff } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useProducts, useDeactivateProduct } from "../../hooks";

interface SearchProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchProductModal = ({ isOpen, onClose }: SearchProductModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const { data: products, isLoading } = useProducts();
  const deactivateProduct = useDeactivateProduct();

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleEditProduct = (product: any) => {
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
        navigate("/dashboard/agregar", { state: { product } });
        onClose();
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
        });
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Buscar Productos</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search Form */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, categoría o código de barras..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : !filteredProducts || filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No se encontraron productos</p>
              <p className="text-gray-500 text-sm mt-2">
                Intenta con otro término de búsqueda
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {product.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            product.active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {product.active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Categoría:{" "}
                          <span className="font-medium text-gray-800">
                            {product.category}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Precio:{" "}
                          <span className="font-medium text-gray-800">
                            ${product.price.toFixed(2)}
                          </span>
                        </span>
                        <span className="text-gray-600">
                          Stock:{" "}
                          <span
                            className={`font-medium ${
                              product.stock > 10
                                ? "text-green-600"
                                : product.stock > 0
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {product.stock} unidades
                          </span>
                        </span>
                        {product.barcode && (
                          <span className="text-gray-600">
                            Código: <span className="font-mono text-xs">{product.barcode}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleToggleStatus(
                            product.id,
                            product.active,
                            product.name
                          )
                        }
                        className={`p-2 rounded transition ${
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredProducts && filteredProducts.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              Se encontraron{" "}
              <span className="font-semibold">{filteredProducts.length}</span>{" "}
              producto(s)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchProductModal;

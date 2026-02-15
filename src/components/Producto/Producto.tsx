/**
 * Página principal de gestión de productos
 * Adaptada para TanStack Query
 */

import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import SearchProductModal from "./SearchProductModal";

const Producto = () => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-300 rounded-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Gestión de Productos
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Administra tu catálogo de productos
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar
          </button>
          <Link
            to="/dashboard/productos/agregar"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Tabla de productos */}
      {/* Nota: TableProduct debe ser llamado desde ProductPage con props */}

      {/* Modal de búsqueda */}
      <SearchProductModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
};

export default Producto;

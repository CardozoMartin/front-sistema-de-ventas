import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../hooks";
import TableProduct from "../components/Producto/TableProduct";

const ProductosPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Hook para obtener los productos con paginación
  const { data: productos, isLoading, error } = useProducts({ page, limit });
  console.log("Productos obtenidos:", productos);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Productos
        </h2>
        <div className="flex items-center gap-3">

          <button
            onClick={() => navigate("/dashboard/productos/agregar")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
          >
            + Agregar Producto
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
          <p className="text-red-600">
            Error al cargar productos: {(error as any).message}
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-500/30 rounded-md p-6">
        <p className="text-gray-600 mb-3 font-bold">
          Lista completa de productos del inventario.
        </p>

        <div className="w-full p-4 bg-white border border-gray-500/30 rounded-md">
          <TableProduct
            productos={productos}
            isLoading={isLoading}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductosPage;
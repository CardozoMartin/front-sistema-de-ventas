import { useState, useMemo } from "react";
import { AlertTriangle, Clock, BoxSelect, Save, RefreshCw } from "lucide-react";
import { useAllProductsNoPagination, useUpdateProduct, useRunCatalogMaintenance } from "../../hooks";
import { PageHeader } from "../../components/ui/PageHeader";
import type { Product } from "../../services/types";
import { formatCurrency } from "../../utils/formatCurrency";
import Swal from "../../utils/swalTheme";

const getIncompleteReason = (p: Product) => {
  if (!p.costPrice || p.costPrice <= 0) return 'Sin Costo';
  if (p.price < (p.costPrice || 0)) return 'Margen Negativo';
  if (!p.category || p.category.trim() === '') return 'Sin Categoría';
  return 'Incompleto';
};

const CATEGORIES = [
  "Despensa",
  "Bebida",
  "Panadería",
  "Lácteos",
  "Carnicería",
  "Verdulería",
  "Limpieza",
  "Perfumería",
  "Snacks",
  "Congelados",
  "Otros",
];

const categoryOptions = CATEGORIES.reduce((acc, cat) => {
  acc[cat] = cat;
  return acc;
}, {} as Record<string, string>);

export default function CatalogMaintenance() {
  const { data: allProducts, isLoading } = useAllProductsNoPagination();
  const updateProduct = useUpdateProduct();
  const runMaintenance = useRunCatalogMaintenance();

  const [filterType, setFilterType] = useState<"incompleto" | "sin_movimiento" | "pendiente_revision" | "all">("all");

  const problemProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(p => p.status === 'incompleto' || p.status === 'sin_movimiento' || p.status === 'pendiente_revision');
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (filterType === "all") return problemProducts;
    return problemProducts.filter(p => p.status === filterType);
  }, [problemProducts, filterType]);

  const countIncompleto = useMemo(() => problemProducts.filter(p => p.status === 'incompleto').length, [problemProducts]);
  const countSinMovimiento = useMemo(() => problemProducts.filter(p => p.status === 'sin_movimiento').length, [problemProducts]);
  const countPendiente = useMemo(() => problemProducts.filter(p => p.status === 'pendiente_revision').length, [problemProducts]);

  const handleQuickFix = (product: Product, updates: Partial<Product>) => {
    updateProduct.mutate(
      { id: product.id, data: { ...updates, status: 'activo' } },
      {
        onSuccess: () => Swal.fire("Corregido", "El producto ha sido actualizado.", "success"),
        onError: () => Swal.fire("Error", "No se pudo actualizar.", "error")
      }
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col gap-6 p-5 sm:p-6">
      <PageHeader
        title="Salud del Catálogo"
        description="Revisa y corrige productos con problemas en stock o precio para mantener el inventario limpio."
        actions={
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70"
            onClick={() => {
              runMaintenance.mutate(undefined, {
                onSuccess: () => Swal.fire('¡Listo!', 'El escaneo del catálogo finalizó con éxito.', 'success'),
                onError: () => Swal.fire('Error', 'No se pudo escanear el catálogo.', 'error')
              });
            }}
            disabled={runMaintenance.isPending}
          >
            <RefreshCw className={`w-4 h-4 ${runMaintenance.isPending ? 'animate-spin' : ''}`} />
            {runMaintenance.isPending ? 'Escaneando...' : 'Escanear Catálogo'}
          </button>
        }
      />

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => setFilterType("incompleto")} className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${filterType === 'incompleto' ? 'border-red-500 bg-red-50' : 'border-neutral-200 bg-white hover:border-red-300'}`}>
          <div className="p-3 bg-red-100 rounded-lg text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-bold text-neutral-900">{countIncompleto}</h3>
            <p className="text-sm text-neutral-500 font-medium">Incompletos / Con Problemas</p>
          </div>
        </button>

        <button onClick={() => setFilterType("sin_movimiento")} className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${filterType === 'sin_movimiento' ? 'border-orange-500 bg-orange-50' : 'border-neutral-200 bg-white hover:border-orange-300'}`}>
          <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
            <BoxSelect className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-bold text-neutral-900">{countSinMovimiento}</h3>
            <p className="text-sm text-neutral-500 font-medium">Sin Movimiento (+60 días)</p>
          </div>
        </button>

        <button onClick={() => setFilterType("pendiente_revision")} className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${filterType === 'pendiente_revision' ? 'border-yellow-500 bg-yellow-50' : 'border-neutral-200 bg-white hover:border-yellow-300'}`}>
          <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-bold text-neutral-900">{countPendiente}</h3>
            <p className="text-sm text-neutral-500 font-medium">Pendiente de Revisión</p>
          </div>
        </button>
      </div>

      {/* Lista de Acciones */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="border-b border-neutral-200 p-4 flex justify-between items-center bg-neutral-50/50">
          <h2 className="text-lg font-semibold text-neutral-800">
            {filterType === 'all' ? 'Todos los problemas' : 
             filterType === 'incompleto' ? 'Productos Incompletos' :
             filterType === 'sin_movimiento' ? 'Stock estancado' : 'Requieren revisión'}
          </h2>
          {filterType !== 'all' && (
            <button onClick={() => setFilterType("all")} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Ver todos
            </button>
          )}
        </div>

        <div className="p-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-12"><div className="spinner"></div></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                <BoxSelect className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-1">¡Todo limpio!</h3>
              <p>No hay productos en esta categoría.</p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {filteredProducts.map(p => (
                <li key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${p.status === 'incompleto' ? 'bg-red-100 text-red-700' : 
                          p.status === 'sin_movimiento' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}
                      `}>
                        {p.status === 'incompleto' ? getIncompleteReason(p) : p.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-neutral-500">Código: {p.code}</span>
                    </div>
                    <h4 className="font-semibold text-neutral-900">{p.name}</h4>
                    <p className="text-sm text-neutral-600 mt-1">
                      Precio Venta: <span className={`font-medium ${p.price < (p.costPrice || 0) ? 'text-red-500' : ''}`}>{formatCurrency(p.price)}</span> | 
                      Costo: <span className={`font-medium ${!p.costPrice || p.costPrice === 0 ? 'text-red-500' : ''}`}>{formatCurrency(p.costPrice || 0)}</span> | 
                      Stock: <span className="font-medium">{p.stock}</span> | 
                      Categoría: <span className={`font-medium ${!p.category || p.category.trim() === '' ? 'text-red-500' : ''}`}>{p.category || 'Ninguna'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.status === 'incompleto' && (!p.costPrice || p.costPrice <= 0) && (
                      <button 
                        className="btn-outline-primary text-sm py-1.5 px-3"
                        onClick={() => {
                          Swal.fire({
                            title: 'Corregir Costo',
                            input: 'number',
                            inputLabel: 'Nuevo Precio de Costo ($)',
                            inputValue: p.costPrice || 0,
                            showCancelButton: true,
                            confirmButtonText: 'Guardar',
                          }).then(res => {
                            if (res.isConfirmed && res.value) {
                              handleQuickFix(p, { costPrice: Number(res.value) });
                            }
                          });
                        }}
                      >
                        <Save className="w-4 h-4 mr-1.5 inline" />
                        Corregir Costo
                      </button>
                    )}
                    {p.status === 'incompleto' && p.costPrice && p.costPrice > 0 && p.price < p.costPrice && (
                      <button 
                        className="btn-outline-primary text-sm py-1.5 px-3"
                        onClick={() => {
                          Swal.fire({
                            title: 'Corregir Venta',
                            input: 'number',
                            inputLabel: `Costo actual: $${p.costPrice}. Nuevo Precio de Venta ($):`,
                            inputValue: p.price,
                            showCancelButton: true,
                            confirmButtonText: 'Guardar',
                          }).then(res => {
                            if (res.isConfirmed && res.value) {
                              handleQuickFix(p, { price: Number(res.value) });
                            }
                          });
                        }}
                      >
                        <Save className="w-4 h-4 mr-1.5 inline" />
                        Corregir Venta
                      </button>
                    )}
                    {p.status === 'incompleto' && p.costPrice && p.costPrice > 0 && p.price >= p.costPrice && (!p.category || p.category.trim() === '') && (
                      <button 
                        className="btn-outline-primary text-sm py-1.5 px-3"
                        onClick={() => {
                          Swal.fire({
                            title: 'Asignar Categoría',
                            input: 'select',
                            inputOptions: categoryOptions,
                            inputPlaceholder: 'Selecciona una categoría',
                            showCancelButton: true,
                            confirmButtonText: 'Guardar',
                          }).then(res => {
                            if (res.isConfirmed && res.value) {
                              handleQuickFix(p, { category: res.value });
                            }
                          });
                        }}
                      >
                        <Save className="w-4 h-4 mr-1.5 inline" />
                        Añadir Categoría
                      </button>
                    )}
                    {(p.status === 'sin_movimiento' || p.status === 'pendiente_revision') && (
                      <button 
                        className="btn-outline-primary text-sm py-1.5 px-3"
                        onClick={() => handleQuickFix(p, {})}
                      >
                        Marcar como Activo
                      </button>
                    )}
                    <button 
                      className="btn-outline-neutral text-sm py-1.5 px-3 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                      onClick={() => handleQuickFix(p, { status: 'oculto' })}
                      title="Ocultar producto si ya no se vende"
                    >
                      Ocultar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

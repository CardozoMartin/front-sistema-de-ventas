import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { useSearchProductsByQuery, useUpdateProduct } from '../hooks/useProducts';
import type { UpdateProductDto, Product } from '../services/types';
import { Package, TrendingUp, ChevronDown, X } from 'lucide-react';

const UpdateProductPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProductDto>({
    defaultValues: selectedProduct || undefined
  });

  const { data: searchResults = [], isLoading: isSearching } = useSearchProductsByQuery(searchInput, true);
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  // Mostrar dropdown si hay resultados y input tiene valor
  const showResults = useMemo(() => {
    return showDropdown && searchInput.trim().length > 0 && searchResults.length > 0;
  }, [showDropdown, searchInput, searchResults]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearchInput('');
    setShowDropdown(false);
    reset({
      name: product.name,
      code: product.code,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      unitType: product.unitType,
      category: product.category,
    });
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    reset({});
    setSearchInput('');
  };

  const onSubmit = (data: UpdateProductDto) => {
    if (!selectedProduct) return;

    let hasChanges = false;
    const updateData: UpdateProductDto = {};

    // Solo incluir campos que han cambiado
    if (data.name !== undefined && data.name !== selectedProduct.name) {
      updateData.name = data.name;
      hasChanges = true;
    }
    if (data.code !== undefined && data.code !== selectedProduct.code) {
      updateData.code = data.code;
      hasChanges = true;
    }
    if (data.description !== undefined && data.description !== selectedProduct.description) {
      updateData.description = data.description;
      hasChanges = true;
    }
    if (data.price !== undefined && data.price !== selectedProduct.price) {
      updateData.price = data.price;
      hasChanges = true;
    }
    if (data.costPrice !== undefined && data.costPrice !== selectedProduct.costPrice) {
      updateData.costPrice = data.costPrice;
      hasChanges = true;
    }
    if (data.stock !== undefined && data.stock !== selectedProduct.stock) {
      updateData.stock = data.stock;
      hasChanges = true;
    }
    if (data.unitType !== undefined && data.unitType !== selectedProduct.unitType) {
      updateData.unitType = data.unitType;
      hasChanges = true;
    }
    if (data.category !== undefined && data.category !== selectedProduct.category) {
      updateData.category = data.category;
      hasChanges = true;
    }

    if (!hasChanges) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No hay cambios que guardar',
        confirmButtonText: 'OK',
      });
      return;
    }

    updateProduct(
      { id: selectedProduct.id, data: updateData },
      {
        onSuccess: () => {
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: `Producto "${selectedProduct.name}" actualizado correctamente`,
            confirmButtonText: 'OK',
          }).then(() => {
            handleClearSelection();
          });
        },
        onError: (error: any) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error?.message || 'No se pudo actualizar el producto',
            confirmButtonText: 'OK',
          });
        },
      }
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-50 to-white p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-2'>
            <TrendingUp className='w-8 h-8 text-blue-600' />
            <h1 className='text-3xl font-bold text-gray-800'>Editar Productos</h1>
          </div>
          <p className='text-gray-600'>Busca y edita todos los detalles de tus productos</p>
        </div>

        {/* Search Section */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200'>
          <label className='block text-sm font-medium text-gray-700 mb-3'>
            Buscar producto por nombre, código o descripción
          </label>
          <div className='relative'>
            <input
              type="text"
              className='w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Ej: Rexona, TOR001, Desodorante...'
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              disabled={selectedProduct !== null}
            />

            {/* Dropdown de resultados */}
            {showResults && (
              <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto z-50'>
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className='w-full px-4 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition'
                  >
                    <div className='flex justify-between items-start'>
                      <div>
                        <p className='font-medium text-gray-800'>{product.name}</p>
                        <p className='text-xs text-gray-500'>{product.code}</p>
                      </div>
                      <span className='text-sm text-gray-600'>${product.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {isSearching && searchInput.trim() && (
              <div className='absolute right-3 top-3'>
                <div className='animate-spin'>
                  <ChevronDown className='w-5 h-5 text-blue-600' />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Edit Form */}
        {selectedProduct && (
          <form onSubmit={handleSubmit(onSubmit)} className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden'>
            {/* Header del formulario */}
            <div className='p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100'>
              <div className='flex justify-between items-start'>
                <div className='flex items-start gap-4'>
                  <div className='flex items-center justify-center w-14 h-14 bg-blue-200 rounded-lg'>
                    <Package className='w-8 h-8 text-blue-600' />
                  </div>
                  <div>
                    <h2 className='text-2xl font-bold text-gray-800'>{selectedProduct.name}</h2>
                    <p className='text-sm text-gray-600 mt-1'>Código: {selectedProduct.code}</p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={handleClearSelection}
                  className='p-2 hover:bg-gray-200 rounded-lg transition'
                >
                  <X className='w-5 h-5 text-gray-600' />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className='p-6 bg-gray-50'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Nombre */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Nombre
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className='w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.name && <p className='text-red-600 text-sm mt-1'>{errors.name.message}</p>}
                </div>

                {/* Código */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Código
                  </label>
                  <input
                    type="text"
                    {...register('code')}
                    className='w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.code && <p className='text-red-600 text-sm mt-1'>{errors.code.message}</p>}
                </div>

                {/* Precio */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Precio de Venta
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className='w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.price && <p className='text-red-600 text-sm mt-1'>{errors.price.message}</p>}
                </div>

                {/* Precio de Costo */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Precio de Costo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('costPrice', { valueAsNumber: true })}
                    className='w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.costPrice && <p className='text-red-600 text-sm mt-1'>{errors.costPrice.message}</p>}
                </div>

                {/* Stock */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Stock
                  </label>
                  <input
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    className='w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.stock && <p className='text-red-600 text-sm mt-1'>{errors.stock.message}</p>}
                </div>

                {/* Tipo de Unidad */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Tipo de Unidad
                  </label>
                  <input
                    type="text"
                    {...register('unitType')}
                    className='w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.unitType && <p className='text-red-600 text-sm mt-1'>{errors.unitType.message}</p>}
                </div>

                {/* Categoría */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Categoría
                  </label>
                  <input
                    type="text"
                    {...register('category')}
                    className='w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.category && <p className='text-red-600 text-sm mt-1'>{errors.category.message}</p>}
                </div>

                {/* Descripción - Full width */}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    {...register('description')}
                    className='w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  {errors.description && <p className='text-red-600 text-sm mt-1'>{errors.description.message}</p>}
                </div>
              </div>

              {/* Buttons */}
              <div className='flex gap-3 mt-8 justify-end'>
                <button
                  type='button'
                  onClick={handleClearSelection}
                  className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition font-medium'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  disabled={isUpdating}
                  className='px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium'
                >
                  {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Empty State */}
        {!selectedProduct && !searchInput && (
          <div className='text-center py-12'>
            <Package className='w-12 h-12 text-gray-300 mx-auto mb-3' />
            <p className='text-gray-400'>Busca un producto para comenzar a editar</p>
          </div>
        )}

        {!selectedProduct && searchInput && !isSearching && searchResults.length === 0 && (
          <div className='text-center py-12'>
            <Package className='w-12 h-12 text-gray-300 mx-auto mb-3' />
            <p className='text-gray-400'>No se encontraron productos con "{searchInput}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateProductPage
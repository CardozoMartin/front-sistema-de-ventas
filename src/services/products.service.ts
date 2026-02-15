import { apiClient } from './api.config';
import type {
  ApiResponse,
  Product,
  CreateProductDto,
  UpdateProductDto,
  PaginatedProducts,
} from './types';

/**
 * Obtener todos los productos con paginación
 */
export const getAllProducts = async (page: number = 1, limit: number = 10): Promise<PaginatedProducts> => {
  const response = await apiClient.get<ApiResponse<PaginatedProducts>>('/products', {
    params: { page, limit },
  });
  return response.data.data;
};

/**
 * Obtener un producto por ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data.data;
};

/**
 * Crear un nuevo producto
 */
export const createProduct = async (product: CreateProductDto): Promise<Product> => {
  const response = await apiClient.post<ApiResponse<Product>>('/products', product);
  return response.data.data;
};

/**
 * Actualizar un producto existente
 */
export const updateProduct = async (
  id: string,
  product: UpdateProductDto
): Promise<Product> => {
  const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, product);
  return response.data.data;
};

/**
 * Eliminar un producto
 */
export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};

/**
 * Aumentar el stock de un producto
 */
export const increaseStock = async (
  id: string,
  quantity: number
): Promise<Product> => {
  const response = await apiClient.post<ApiResponse<Product>>(
    `/products/${id}/increase-stock`,
    { quantity }
  );
  return response.data.data;
};

/**
 * Disminuir el stock de un producto
 */
export const decreaseStock = async (
  id: string,
  quantity: number
): Promise<Product> => {
  const response = await apiClient.post<ApiResponse<Product>>(
    `/products/${id}/decrease-stock`,
    { quantity }
  );
  return response.data.data;
};

/**
 * Desactivar un producto
 */
export const deactivateProduct = async (id: string): Promise<Product> => {
  const response = await apiClient.post<ApiResponse<Product>>(
    `/products/${id}/deactivate`
  );
  return response.data.data;
};

/**
 * Obtener todos los productos sin paginacion
 */

export const getAllProductsNoPagination = async (): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse<Product[]>>('/products/all');
  return response.data.data;
}
/**
 * Obtener un producto por nombre o codigo
 */

export const getProductByNameOrCode = async (nameOrCode: string): Promise<Product> => {
  const response = await apiClient.get<ApiResponse<Product>>(`/products/search/${nameOrCode}`);
  return response.data.data;
};

/**
 * Buscar productos por coincidencias (contienen el término)
 */
export const searchProductsByQuery = async (query: string): Promise<Product[]> => {
  const response = await apiClient.get<ApiResponse<Product[]>>('/products/search-match/query', {
    params: { query }
  });
  return response.data.data;
};
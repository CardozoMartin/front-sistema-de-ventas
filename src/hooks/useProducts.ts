/**
 * Hooks personalizados para el módulo de Productos usando TanStack Query
 * Proporciona hooks para todas las operaciones de productos con caché y optimización
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productsService from '../services/products.service';
import type { CreateProductDto, UpdateProductDto, Product } from '../services/types';

// ==================== QUERY KEYS ====================
// Claves para identificar las queries en el caché
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (page?: number, limit?: number) => [...productKeys.lists(), { page, limit }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// ==================== QUERIES (GET) ====================

/**
 * Hook para obtener todos los productos con paginación
 */
export const useProducts = (options?: { page?: number; limit?: number }) => {
  const page = options?.page || 1;
  const limit = options?.limit || 10;

  return useQuery({
    queryKey: productKeys.list(page, limit),
    queryFn: () => productsService.getAllProducts(page, limit),
    staleTime: 5 * 60 * 1000, // Los datos se consideran frescos por 5 minutos
  });
};

/**
 * Hook para obtener un producto específico por ID
 */
export const useProduct = (id: string, enabled = true) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getProductById(id),
    enabled: enabled && !!id, // Solo ejecutar si está habilitado y el ID es válido
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== MUTATIONS (POST, PUT, DELETE) ====================

/**
 * Hook para crear un nuevo producto
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: CreateProductDto) => productsService.createProduct(product),
    onSuccess: () => {
      // Invalidar el caché de la lista de productos para refrescar los datos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'all'] });

    },
  });
};

/**
 * Hook para actualizar un producto existente
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      // Invalidar tanto la lista como el detalle del producto
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'all'] });

    },
  });
};

/**
 * Hook para eliminar un producto
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.deleteProduct(id),
    onSuccess: () => {
      // Invalidar la lista de productos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'all'] });

    },
  });
};

/**
 * Hook para aumentar el stock de un producto
 */
export const useIncreaseStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      productsService.increaseStock(id, quantity),
    onSuccess: (_, variables) => {
      // Invalidar tanto la lista como el detalle del producto
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'all'] });

    },
  });
};

/**
 * Hook para disminuir el stock de un producto
 */
export const useDecreaseStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      productsService.decreaseStock(id, quantity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'all'] });
    },
  });
};

/**
 * Hook para desactivar un producto
 */
export const useDeactivateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.deactivateProduct(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: [...productKeys.all, 'all'] });
    },
  });
};

/**
 * Hook para obtener todos los productos sin paginación (para búsquedas rápidas en el carrito)
 * 
 */

export const useAllProductsNoPagination = () => {
  return useQuery({
    queryKey: [...productKeys.all, 'all'] as const,
    queryFn: () => productsService.getAllProductsNoPagination(),
    staleTime: 10 * 60 * 1000, // Considerar los datos frescos por 10 minutos
  });
};

/**
 * Hook para obtener productos del localStorage (sin hacer peticiones API)
 * Ideal para búsquedas en punto de venta sin paginación
 */
export const useProductsFromLocalStorage = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const productsJson = localStorage.getItem('products');
    return productsJson ? JSON.parse(productsJson) : [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const productsJson = localStorage.getItem('products');
      setProducts(productsJson ? JSON.parse(productsJson) : []);
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return products;
};

/**
 * Hook para obtener un producto por nombre o código
 */

export const useProductByNameOrCode = (nameOrCode: string, enabled = true) => {
  return useQuery({
    queryKey: ['product', 'search', nameOrCode] as const,
    queryFn: () => productsService.getProductByNameOrCode(nameOrCode),
    enabled: enabled && nameOrCode.trim() !== '', // Solo ejecutar si está habilitado y el término de búsqueda no está vacío
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para buscar productos por coincidencias
 */
export const useSearchProductsByQuery = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ['products', 'search-match', query] as const,
    queryFn: () => productsService.searchProductsByQuery(query),
    enabled: enabled && query.trim().length > 0,
    staleTime: 3 * 60 * 1000,
  });
};

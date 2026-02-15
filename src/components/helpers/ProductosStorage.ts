import type { Product } from "../../services";


export const saveProductsToLocalStorage = (products: Product[]) => {
  localStorage.setItem('products', JSON.stringify(products));
};

export const getProductsFromLocalStorage = (): Product[] => {
  const productsJson = localStorage.getItem('products');
  return productsJson ? JSON.parse(productsJson) : [];
};

export const clearProductsFromLocalStorage = () => {
  localStorage.removeItem('products');
};
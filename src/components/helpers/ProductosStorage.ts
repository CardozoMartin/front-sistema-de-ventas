import type { Product } from "../../services";

export const PRODUCTS_LOCAL_UPDATED_EVENT = "products-local-updated";

export const saveProductsToLocalStorage = (products: Product[]) => {
  localStorage.setItem("products", JSON.stringify(products));
  window.dispatchEvent(new Event(PRODUCTS_LOCAL_UPDATED_EVENT));
};

export const getProductsFromLocalStorage = (): Product[] => {
  const productsJson = localStorage.getItem("products");
  if (!productsJson) return [];
  try {
    const parsed = JSON.parse(productsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const clearProductsFromLocalStorage = () => {
  localStorage.removeItem("products");
  window.dispatchEvent(new Event(PRODUCTS_LOCAL_UPDATED_EVENT));
};

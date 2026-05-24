import type { Promotion } from "../../services/promotions.service";

export const PROMOTIONS_LOCAL_UPDATED_EVENT = "promotions-local-updated";

export const savePromotionsToLocalStorage = (promotions: Promotion[]) => {
  localStorage.setItem("promotions", JSON.stringify(promotions));
  window.dispatchEvent(new Event(PROMOTIONS_LOCAL_UPDATED_EVENT));
};

export const getPromotionsFromLocalStorage = (): Promotion[] => {
  const promotionsJson = localStorage.getItem("promotions");
  if (!promotionsJson) return [];
  try {
    const parsed = JSON.parse(promotionsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const clearPromotionsFromLocalStorage = () => {
  localStorage.removeItem("promotions");
  window.dispatchEvent(new Event(PROMOTIONS_LOCAL_UPDATED_EVENT));
};

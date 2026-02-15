import type { Promotion } from "../../services/promotions.service";

export const savePromotionsToLocalStorage = (promotions: Promotion[]) => {
  localStorage.setItem('promotions', JSON.stringify(promotions));
};

export const getPromotionsFromLocalStorage = (): Promotion[] => {
  const promotionsJson = localStorage.getItem('promotions');
  return promotionsJson ? JSON.parse(promotionsJson) : [];
};

export const clearPromotionsFromLocalStorage = () => {
  localStorage.removeItem('promotions');
};

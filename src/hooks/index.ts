/**
 * Archivo índice para exportar todos los hooks personalizados
 * Facilita las importaciones en otros archivos
 */

// ==================== PRODUCTOS ====================
export {
  useProducts,
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useIncreaseStock,
  useDecreaseStock,
  useDeactivateProduct,
  useProductByNameOrCode,
  useSearchProductsByQuery,
  useAllProductsNoPagination,
  productKeys,
} from './useProducts';

// ==================== USUARIOS ====================
export {
  useUsers,
  useUser,
  useLogin,
  useLogout,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  userKeys,
} from './useUsers';

// ==================== VENTAS ====================
export {
  useSales,
  useSale,
  useSalesBySeller,
  useSalesByCashRegister,
  useCreateSale,
  useUpdateSale,
  useCancelSale,
  useCompleteSale,
  saleKeys,
} from './useSales';

// ==================== CAJAS ====================
export {
  useCashRegisters,
  useCashRegister,
  useOpenCashRegister,
  useCashRegistersByUser,
  useOpenCashRegisterMutation,
  useCloseCashRegister,
  cashRegisterKeys,
} from './useCashRegister';

// ==================== AUDITORÍA ====================
export {
  useAudits,
  useAudit,
  useAuditsByUser,
  useAuditsByEntity,
  useAuditsByAction,
  useCreateAudit,
  useDeleteAllAudits,
  auditKeys,
} from './useAudit';
// ==================== PROMOCIONES ====================
export {
  usePromotions,
  useActivePromotions,
  usePromotion,
  useAllPromotionsNoPagination,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useIncreasePromotionStock,
  useDecreasePromotionStock,
  useDeactivatePromotion,
  promotionKeys,
} from './usePromotions';
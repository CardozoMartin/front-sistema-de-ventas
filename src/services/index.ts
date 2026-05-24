/**
 * Archivo índice para exportar todos los servicios
 * Facilita las importaciones en otros archivos
 */

// ==================== CONFIGURACIÓN ====================
export { apiClient } from './api.config';

// ==================== TIPOS ====================
export * from './types';

// ==================== SERVICIOS ====================
export * as productsService from './products.service';
export * as usersService from './users.service';
export * as salesService from './sales.service';
export * as cashRegisterService from './cashRegister.service';
export * as auditService from './audit.service';
export * as promotionsService from './promotions.service';

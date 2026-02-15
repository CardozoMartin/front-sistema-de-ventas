/**
 * Tipos e interfaces compartidas para todos los servicios
 * Define las estructuras de datos que usa la aplicación
 */

// ==================== TIPOS BASE ====================

/**
 * Respuesta genérica del API
 * Todas las respuestas del backend siguen esta estructura
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ==================== USUARIO ====================

/**
 * Interfaz para el modelo de Usuario
 */
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'vendedor';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Datos para crear un nuevo usuario
 */
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'vendedor';
}

/**
 * Datos para actualizar un usuario
 */
export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'vendedor';
  isActive?: boolean;
}

/**
 * Credenciales para login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Respuesta del login con token
 */
export interface LoginResponse {
  token: string;
  user: User;
}

// ==================== PRODUCTO ====================

/**
 * Interfaz para el modelo de Producto
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  stock: number;
  category: string;
  unitType?: string;
  code?: string;        // Campo del backend
  barcode?: string;     // Alias para code
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Datos para crear un nuevo producto
 */
export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  code?: string;        // Campo del backend
  barcode?: string;     // Alias
}

/**
 * Datos para actualizar un producto
 */
export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  costPrice?: number;
  stock?: number;
  unitType?: string;
  category?: string;
  code?: string;        // Campo del backend
  barcode?: string;     // Alias
  isActive?: boolean;
}

/**
 * Datos para aumentar/disminuir stock
 */
export interface StockChangeDto {
  quantity: number;
}

/**
 * Información de paginación
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Respuesta paginada de productos
 */
export interface PaginatedProducts {
  products: Product[];
  pagination: PaginationInfo;
}

// ==================== VENTA ====================

/**
 * Tipos de pago disponibles
 */
export type PaymentMethod = 'efectivo' | 'transferencia' | 'cuenta_corriente';

/**
 * Estados de una venta
 */
export type SaleStatus = 'pendiente' | 'pagado' | 'cancelado';

/**
 * Tipo de unidad de medida
 */
export type UnitType = 'unidad' | 'kilogramo';

/**
 * Detalle de un producto en la venta
 */
export interface SaleDetail {
  id: string;
  sale: string;
  product: string;
  productName: string;
  unitType: UnitType;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
  profit?: number;
  createdAt?: string;
}

/**
 * Interfaz para el modelo de Venta
 */
export interface Sale {
  id: string;
  seller: string;
  cashRegister: string;
  total: number;
  totalProfit?: number;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  details?: SaleDetail[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Datos para crear un detalle de venta
 */
export interface CreateSaleDetailDto {
  productId: string;
  quantity: number;
}

/**
 * Datos para crear una nueva venta
 */
export interface CreateSaleDto {
  paymentMethod: PaymentMethod;
  details: CreateSaleDetailDto[];
  notes?: string;
}

/**
 * Datos para actualizar una venta
 */
export interface UpdateSaleDto {
  status?: SaleStatus;
  notes?: string;
}

// ==================== CAJA ====================

/**
 * Interfaz para el modelo de Caja Registradora
 */
export interface CashRegister {
  id: string;
  user: string;
  userName?: string;
  status: 'abierta' | 'cerrada';
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  finalCash?: number;
  leftForNext: number;
  totalCash: number;
  totalTransfer: number;
  totalCuentaCorriente: number;
  totalSales: number;
  salesCount: number;
  expectedCash?: number;
  difference?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Datos para abrir una caja
 */
export interface OpenCashRegisterDto {
  initialCash: number;
  notes?: string;
}

/**
 * Datos para cerrar una caja
 */
export interface CloseCashRegisterDto {
  finalCash: number;
  leftForNext: number;
  notes?: string;
}

// ==================== AUDITORÍA ====================

/**
 * Interfaz para el modelo de Auditoría
 */
export interface Audit {
  id: number;
  userId: number;
  userName?: string;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
  createdAt: string;
}

/**
 * Datos para crear un registro de auditoría
 */
export interface CreateAuditDto {
  userId: number;
  action: string;
  entity: string;
  entityId?: number;
  details?: string;
}

/**
 * Parámetros para buscar auditorías por entidad
 */
export interface AuditEntitySearchParams {
  entity: string;
  entityId?: number;
}

/**
 * Parámetros para buscar auditorías por acción
 */
export interface AuditActionSearchParams {
  action: string;
}

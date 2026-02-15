// Definición de roles del sistema
export const ROLES = {
  ADMIN: 'admin',
  VENDEDOR: 'vendedor',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Define qué rutas puede acceder cada rol
export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  // Dashboard principal - Acceso para todos los roles autenticados
  '/dashboard': [ROLES.ADMIN, ROLES.VENDEDOR],
  
  // Módulo de Productos - Solo admin puede gestionar productos
  '/dashboard/productos': [ROLES.ADMIN],
  '/dashboard/productos/agregar': [ROLES.ADMIN],
  '/dashboard/productos/editar': [ROLES.ADMIN],
  
  // Módulo de Promociones - Solo admin puede gestionar promociones
  '/dashboard/promociones': [ROLES.ADMIN],
  '/dashboard/promociones/agregar': [ROLES.ADMIN],
  '/dashboard/promociones/editar': [ROLES.ADMIN],
  '/dashboard/promociones/editar/:id': [ROLES.ADMIN],
  
  // Punto de Venta - Acceso para admin y vendedor
  '/dashboard/punto-venta': [ROLES.ADMIN, ROLES.VENDEDOR],
  
  // Cajas - Acceso para admin y vendedor
  '/dashboard/cajas': [ROLES.ADMIN, ROLES.VENDEDOR],
  
  // Ventas - Admin puede ver todo, vendedor solo sus ventas
  '/dashboard/ventas': [ROLES.ADMIN, ROLES.VENDEDOR],
  
  // Clientes - Solo admin
  '/dashboard/clientes': [ROLES.ADMIN],
  
  // Categorías - Solo admin
  '/dashboard/categorias': [ROLES.ADMIN],
  
  // Unidades - Solo admin
  '/dashboard/unidades': [ROLES.ADMIN],
  
  // Actualizar Stock - Solo admin
  '/dashboard/update-stock': [ROLES.ADMIN],
  
  // Gestión de Usuarios - Solo admin
  '/dashboard/usuarios': [ROLES.ADMIN],
  
  // Reportes y Analytics - Solo admin
  '/dashboard/reportes': [ROLES.ADMIN],
  '/dashboard/analytics': [ROLES.ADMIN],
  
  // Auditoría - Solo admin
  '/dashboard/auditoria': [ROLES.ADMIN],
  
  // Configuración - Solo admin
  '/dashboard/configuracion': [ROLES.ADMIN],
  
  // Perfil de usuario - Acceso para todos
  '/dashboard/perfil': [ROLES.ADMIN, ROLES.VENDEDOR],
  
  // Página de acceso denegado - Acceso para todos
  '/dashboard/acceso-denegado': [ROLES.ADMIN, ROLES.VENDEDOR],
};

/**
 * Verifica si un rol tiene acceso a una ruta específica
 * @param userRole - Rol del usuario (admin o vendedor)
 * @param route - Ruta a verificar
 * @returns true si el usuario tiene acceso, false en caso contrario
 */
export const canAccessRoute = (userRole: string, route: string): boolean => {
  // Normalizar el rol a minúsculas
  const normalizedRole = userRole.toLowerCase();
  
  // Buscar permisos exactos para la ruta
  let allowedRoles = ROUTE_PERMISSIONS[route];
  
  // Si no hay coincidencia exacta, buscar patrón (para rutas con parámetros)
  if (!allowedRoles) {
    // Remover IDs y parámetros dinámicos de la ruta
    // Por ejemplo: /dashboard/promociones/editar/abc123 -> /dashboard/promociones/editar
    const routePattern = route.replace(/\/[a-f0-9]{24}$/i, '').replace(/\/\d+$/, '');
    allowedRoles = ROUTE_PERMISSIONS[routePattern];
    
    // Si aún no hay coincidencia, intentar con el patrón :id
    if (!allowedRoles) {
      const routeWithParam = routePattern + '/:id';
      allowedRoles = ROUTE_PERMISSIONS[routeWithParam];
    }
  }
  
  if (allowedRoles) {
    return allowedRoles.includes(normalizedRole as Role);
  }
  
  // Si no hay permisos específicos para la ruta, denegar acceso
  return false;
};
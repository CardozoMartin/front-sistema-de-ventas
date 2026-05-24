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
  '/dashboard/clientes/agregar': [ROLES.ADMIN],
  '/dashboard/clientes/editar': [ROLES.ADMIN],
  '/dashboard/clientes/editar/:id': [ROLES.ADMIN],
  
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
  const allowedRoles = ROUTE_PERMISSIONS[route];
  
  // Si hay coincidencia exacta, verificar y retornar
  if (allowedRoles) {
    return allowedRoles.includes(normalizedRole as Role);
  }
  
  // Si no hay coincidencia exacta, buscar patrón (para rutas con parámetros)
  // Buscar todas las rutas en ROUTE_PERMISSIONS que podrían coincidir
  for (const [routePattern, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    // Si el patrón contiene :id, comprobar si la ruta actual coincide
    if (routePattern.includes('/:id')) {
      // Remover /:id del patrón y comprobar si la ruta coincide
      const basePattern = routePattern.replace('/:id', '');
      
      // Comprobar si la ruta comienza con el patrón base
      if (route.startsWith(basePattern + '/')) {
        // Verificar que después del patrón base, hay un ID (no más rutas)
        const remainder = route.substring(basePattern.length + 1);
        // Permitir IDs: MongoDB (24 hex chars) o números
        if (/^[a-f0-9]{24}$/i.test(remainder) || /^\d+$/.test(remainder)) {
          return roles.includes(normalizedRole as Role);
        }
      }
    }
  }
  
  // Si no hay permisos específicos para la ruta, denegar acceso
  return false;
};
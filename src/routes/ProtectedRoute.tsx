import { Navigate, useLocation } from 'react-router-dom';


import { useAuthSession } from '../store/useAuthSession';
import { canAccessRoute } from '../config/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user } = useAuthSession();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especifican roles requeridos, verificar
  if (requiredRoles && requiredRoles.length > 0) {
    // Buscar el rol: primero en user.role (string), luego en user.rol[0].nombre (array)
    const userRole = user.role?.toLowerCase() || user?.rol?.[0]?.nombre?.toLowerCase() || '';
    console.log('User Role:', userRole, 'Required:', requiredRoles);
    
    const hasPermission = requiredRoles.some(role => 
      role.toLowerCase() === userRole
    );

    if (!hasPermission) {
      console.warn('Acceso denegado. Rol del usuario:', userRole, 'Roles requeridos:', requiredRoles);
      // Redirigir a página de acceso denegado o dashboard
      return <Navigate to="/dashboard/acceso-denegado" replace />;
    }
  }

  // También verificar por la ruta actual
  const userRole = user.role?.toLowerCase() || user?.rol?.[0]?.nombre?.toLowerCase() || '';
  if (!canAccessRoute(userRole, location.pathname)) {
    return <Navigate to="/dashboard/acceso-denegado" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
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

  // Obtener el rol del usuario
  const userRole = user.role?.toLowerCase() || user?.rol?.[0]?.nombre?.toLowerCase() || '';

  // Si se especifican roles requeridos, verificar
  if (requiredRoles && requiredRoles.length > 0) {
    const hasPermission = requiredRoles.some(role => 
      role.toLowerCase() === userRole
    );

    if (!hasPermission) {
      return <Navigate to="/dashboard/acceso-denegado" replace />;
    }
  } else {
    // Si no se especifican roles requeridos, verificar por la ruta actual
    if (!canAccessRoute(userRole, location.pathname)) {
      return <Navigate to="/dashboard/acceso-denegado" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
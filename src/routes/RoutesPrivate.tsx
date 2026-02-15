// src/routes/RoutesPrivate.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthSession } from '../store/useAuthSession';

const RoutesPrivate = () => {
  const { isLoggedIn, checkSession, startSessionCheck } = useAuthSession();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  // Verificar la sesión al montar el componente
  useEffect(() => {
    const check = checkSession();
    setIsChecking(false);
    console.log("Session check result:", check);

    // Iniciar verificación automática si hay sesión válida
    if (check) {
      startSessionCheck();
    }
  }, [checkSession, startSessionCheck]);

  // Verificar también cuando cambia la ubicación
  useEffect(() => {
    if (!isChecking) {
      checkSession();
    }
  }, [location.pathname, checkSession, isChecking]);

  // Mostrar un loading mientras se verifica la sesión
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    // Guardar la ruta intentada para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RoutesPrivate;
import { useNavigate } from "react-router-dom";
import { ShieldX, Home } from "lucide-react";
import { useAuthSession } from "../store/useAuthSession";

const AccesoDenegadoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthSession();

  const handleGoBack = () => {
    // Redirigir según el rol del usuario
    const userRole = user?.rol?.[0]?.nombre?.toLowerCase() ?? '';
    
    if (userRole === 'admin') {
      navigate('/dashboard/productos');
    } else if (userRole === 'vendedor') {
      navigate('/dashboard/punto-venta');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 p-4">
      <div className="max-w-md w-full text-center">
        {/* Icono de advertencia */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <ShieldX className="w-10 h-10 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Acceso Denegado
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-2">
          No tienes permisos para acceder a esta página.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Tu rol actual: <span className="font-semibold text-gray-700">
            {user?.rol?.[0]?.nombre ?? 'Sin rol'}
          </span>
        </p>

        {/* Acciones */}
        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Home size={20} />
            Volver al Inicio
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Regresar
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Información:</strong> Si crees que deberías tener acceso a esta página, 
            contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccesoDenegadoPage;

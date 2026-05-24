import { useNavigate } from "react-router-dom";
import { ShieldX, Home } from "lucide-react";
import { useAuthSession } from "../../store/useAuthSession";

const AccesoDenegadoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthSession();

  const handleGoBack = () => {
    const userRole = user?.rol?.[0]?.nombre?.toLowerCase() ?? "";

    if (userRole === "admin") {
      navigate("/dashboard/productos");
    } else if (userRole === "vendedor") {
      navigate("/dashboard/punto-venta");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <ShieldX className="h-7 w-7 text-red-600" strokeWidth={1.75} />
        </div>

        <h1 className="text-xl font-semibold text-neutral-900">Acceso denegado</h1>
        <p className="mt-2 text-sm text-neutral-600">
          No tenés permisos para acceder a esta página.
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Rol actual:{" "}
          <span className="font-medium text-neutral-700">
            {user?.rol?.[0]?.nombre ?? "Sin rol"}
          </span>
        </p>

        <div className="mt-8 space-y-2">
          <button type="button" onClick={handleGoBack} className="btn-primary w-full py-2.5">
            <Home size={16} />
            Volver al inicio
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary w-full py-2.5">
            Regresar
          </button>
        </div>

        <p className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-600">
          Si creés que deberías tener acceso, contactá al administrador del sistema.
        </p>
      </div>
    </div>
  );
};

export default AccesoDenegadoPage;

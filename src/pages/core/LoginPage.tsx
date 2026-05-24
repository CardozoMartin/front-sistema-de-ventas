import LoginForm from "../../components/Login/LoginForm";
import { Store } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <Store size={22} strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Shaddai - Shop</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Ingresá tus credenciales para continuar
          </p>
        </div>

        <div className="app-card p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
          © 2026 Shaddai - Shop. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

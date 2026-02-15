import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import  { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import { useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
    const { mutate: postLogin, isPending, isSuccess } = useLogin();
  const navigate = useNavigate();

  // Navegar al dashboard cuando el login sea exitoso
  useEffect(() => {
    if (isSuccess) {
      navigate("/dashboard");
    }
  }, [isSuccess, navigate]);

  //RHF ------------------------------------
  const {
    handleSubmit: handleLoginRHF,
    register,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = (data: LoginFormData) => {
    // Lógica de autenticación aquí
    postLogin(data);
  };
  return (
    <form onSubmit={handleLoginRHF(handleLogin)} className="space-y-4">
      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico
        </label>
        <div className="relative">
          <Mail
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            {...register("email", {
              required: "El correo electrónico es obligatorio",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Formato de correo inválido",
              },
            })}
            type="email"
            placeholder="Ingresa tu correo electrónico"
            required
            className="w-full pl-10 pr-4 py-2.5 border border-gray-500/30 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.email && (<div className="text-sm text-red-600 mt-1">
            {errors.email.message}
          </div>)}
        </div>
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <Lock
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: {
                value: 6,
                message: "La contraseña debe tener al menos 6 caracteres",
              },
            })}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            className="w-full pl-10 pr-12 py-2.5 border border-gray-500/30 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
            {errors.password && (<div className="text-sm text-red-600 mt-1">
              {errors.password.message}
            </div>)}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
      >
        {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
      </button>
    </form>
  );
};

export default LoginForm;

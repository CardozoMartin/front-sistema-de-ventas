import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Mail, User, Lock, Shield } from "lucide-react";
import Swal from "../../utils/swalTheme.ts";
import { swalBackdrop, swalCustomClass } from "../../utils/swalTheme";
import { useForm } from "react-hook-form";
import { useUsers, useCreateUser, useUpdateUser } from "../../hooks/useUsers";

interface FormData {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: string;
}

const ROLES = [
  { value: "admin", label: "Admin (1)" },
  { value: "vendedor", label: "Vendedor (2)" },
];

const FormCliente = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    defaultValues: {
      role: "vendedor", // Rol por defecto
    },
  });
  const { data: allUsers = [], isLoading: usersLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  // Buscar el usuario específico en la lista
  const user = isEditMode ? allUsers.find(u => u.id.toString() === id) : null;

  useEffect(() => {
    if (user && isEditMode) {
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("role", user.role || "vendedor");
    }
  }, [user, isEditMode, setValue]);

  const handleFormSubmit = async (formData: FormData) => {
    // Validación básica
    if (!formData.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El nombre es requerido",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
      return;
    }

    if (!formData.email.trim()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El email es requerido",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
      return;
    }

    if (!isEditMode && !formData.password) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "La contraseña es requerida para nuevos empleados",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
      return;
    }

    try {
      if (isEditMode) {
        // Editar empleado
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        updateUserMutation.mutate(
          { id: id as string, data: updateData },
          {
            onSuccess: () => {
              Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "Empleado actualizado correctamente",
                buttonsStyling: false,
                customClass: swalCustomClass,
                backdrop: swalBackdrop,
              }).then(() => {
                navigate("/dashboard/empleados");
              });
            },
            onError: (error: any) => {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "Error al actualizar el empleado",
                buttonsStyling: false,
                customClass: swalCustomClass,
                backdrop: swalBackdrop,
              });
            },
          }
        );
      } else {
        // Crear empleado
        createUserMutation.mutate(
          {
            name: formData.name,
            email: formData.email,
            password: formData.password as string,
            role: formData.role as 'admin' | 'vendedor',
          },
          {
            onSuccess: () => {
              Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "Empleado creado correctamente",
                buttonsStyling: false,
                customClass: swalCustomClass,
                backdrop: swalBackdrop,
              }).then(() => {
                navigate("/dashboard/empleados");
              });
            },
            onError: (error: any) => {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "Error al crear el empleado",
                buttonsStyling: false,
                customClass: swalCustomClass,
                backdrop: swalBackdrop,
              });
            },
          }
        );
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Error al procesar la solicitud",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
    }
  };

  if (usersLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando empleado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full pt-4">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100 w-full mb-6">
        <button
          onClick={() => navigate("/dashboard/empleados")}
          className="p-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-md transition-all hover:scale-105"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
          {isEditMode ? "Editar Empleado" : "Nuevo Empleado"}
        </h1>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 sm:p-8 w-full space-y-5"
      >
        {/* Nombre */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              Nombre Completo <span className="text-rose-500">*</span>
            </div>
          </label>
          <input
            type="text"
            {...register("name", {
              required: "El nombre es requerido",
              minLength: {
                value: 2,
                message: "El nombre debe tener al menos 2 caracteres",
              },
            })}
            className={`w-full px-4 py-3 bg-slate-50 border rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm ${
              errors.name ? "border-rose-400 focus:ring-rose-500/50" : "border-slate-200"
            }`}
            placeholder="Ej: Juan Pérez"
          />
          {errors.name && (
            <p className="text-rose-500 text-xs font-medium mt-1.5">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-slate-400" />
              Email <span className="text-rose-500">*</span>
            </div>
          </label>
          <input
            type="email"
            {...register("email", {
              required: "El email es requerido",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email inválido",
              },
            })}
            className={`w-full px-4 py-3 bg-slate-50 border rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm ${
              errors.email ? "border-rose-400 focus:ring-rose-500/50" : "border-slate-200"
            }`}
            placeholder="ejemplo@email.com"
          />
          {errors.email && (
            <p className="text-rose-500 text-xs font-medium mt-1.5">{errors.email.message}</p>
          )}
        </div>

        {/* Rol */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-slate-400" />
              Rol <span className="text-rose-500">*</span>
            </div>
          </label>
          <select
            {...register("role", {
              required: "El rol es requerido",
            })}
            className={`w-full px-4 py-3 bg-slate-50 border rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm text-slate-700 ${
              errors.role ? "border-rose-400 focus:ring-rose-500/50" : "border-slate-200"
            }`}
          >
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-rose-500 text-xs font-medium mt-1.5">{errors.role.message}</p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-slate-400" />
              {isEditMode ? "Contraseña (vacío = no cambiar)" : "Contraseña"}
            </div>
          </label>
          <input
            type="password"
            {...register("password", {
              required: !isEditMode ? "La contraseña es requerida" : false,
              minLength: {
                value: 6,
                message: "La contraseña debe tener al menos 6 caracteres",
              },
            })}
            className={`w-full px-4 py-3 bg-slate-50 border rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm ${
              errors.password ? "border-rose-400 focus:ring-rose-500/50" : "border-slate-200"
            }`}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-rose-500 text-xs font-medium mt-1.5">{errors.password.message}</p>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-slate-400" />
              Confirmar Contraseña
            </div>
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm"
            placeholder="••••••••"
          />
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/empleados")}
            className="flex-1 px-5 py-3 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-all duration-300 font-bold text-sm order-2 sm:order-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createUserMutation.isPending || updateUserMutation.isPending}
            className="flex-1 px-5 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800  shadow-sm sky-500/30 transition-all duration-300 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {isEditMode 
              ? updateUserMutation.isPending ? "Guardando..." : "Guardar Cambios"
              : createUserMutation.isPending ? "Creando..." : "Crear Empleado"
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormCliente;

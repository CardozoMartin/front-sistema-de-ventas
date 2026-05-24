import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, User, Phone, Mail, DollarSign } from "lucide-react";
import Swal from "../../utils/swalTheme.ts";
import { swalBackdrop, swalCustomClass } from "../../utils/swalTheme";
import { useForm } from "react-hook-form";
import { useClients, useCreateClient, useUpdateClient } from "../../hooks/useClients";

interface FormData {
  name: string;
  phone?: string;
  email?: string;
  maxCredit?: number;
}

const FormRealCliente = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      maxCredit: 0,
    },
  });

  const { data: allClients = [], isLoading: clientsLoading } = useClients();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();

  // Buscar el cliente específico en la lista
  const client = isEditMode ? allClients.find(c => c.id === id) : null;

  useEffect(() => {
    if (client && isEditMode) {
      setValue("name", client.name);
      setValue("phone", client.phone || "");
      setValue("email", client.email || "");
      setValue("maxCredit", client.maxCredit || 0);
    }
  }, [client, isEditMode, setValue]);

  const handleFormSubmit = async (formData: FormData) => {
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

    try {
      if (isEditMode) {
        updateClientMutation.mutate(
          { 
            id: id as string, 
            data: {
              name: formData.name,
              phone: formData.phone || undefined,
              email: formData.email || undefined,
              maxCredit: Number(formData.maxCredit) || undefined,
            } 
          },
          {
            onSuccess: () => {
              Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "Cliente actualizado correctamente",
                buttonsStyling: false,
                customClass: swalCustomClass,
                backdrop: swalBackdrop,
              }).then(() => {
                navigate("/dashboard/clientes");
              });
            },
            onError: (error: any) => {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "Error al actualizar el cliente",
                buttonsStyling: false,
                customClass: swalCustomClass,
                backdrop: swalBackdrop,
              });
            },
          }
        );
      } else {
        createClientMutation.mutate(
          {
            name: formData.name,
            phone: formData.phone || undefined,
            email: formData.email || undefined,
            maxCredit: Number(formData.maxCredit) || undefined,
          },
          {
            onSuccess: () => {
              Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "Cliente creado correctamente",
                buttonsStyling: false,
                customClass: swalCustomClass,
                backdrop: swalBackdrop,
              }).then(() => {
                navigate("/dashboard/clientes");
              });
            },
            onError: (error: any) => {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: error instanceof Error ? error.message : "Error al crear el cliente",
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

  if (clientsLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cliente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full pt-4">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100 w-full mb-6">
        <button
          onClick={() => navigate("/dashboard/clientes")}
          className="p-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-md transition-all hover:scale-105"
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
          {isEditMode ? "Editar Cliente" : "Nuevo Cliente"}
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
            placeholder="Ej: Carlos Gómez"
          />
          {errors.name && (
            <p className="text-rose-500 text-xs font-medium mt-1.5">{errors.name.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-slate-400" />
              Teléfono
            </div>
          </label>
          <input
            type="text"
            {...register("phone")}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm"
            placeholder="Ej: 1123456789"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-slate-400" />
              Email
            </div>
          </label>
          <input
            type="email"
            {...register("email", {
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

        {/* Límite de Crédito */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-slate-400" />
              Límite de Crédito (Fiado Máximo)
            </div>
          </label>
          <input
            type="number"
            {...register("maxCredit")}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm"
            placeholder="0"
          />
          <p className="text-[11px] font-medium text-slate-400 mt-2">Ingresá 0 o dejá vacío para que no tenga límite de crédito.</p>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard/clientes")}
            className="flex-1 px-5 py-3 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-all duration-300 font-bold text-sm order-2 sm:order-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={createClientMutation.isPending || updateClientMutation.isPending}
            className="flex-1 px-5 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800  shadow-sm sky-500/30 transition-all duration-300 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {isEditMode 
              ? updateClientMutation.isPending ? "Guardando..." : "Guardar Cambios"
              : createClientMutation.isPending ? "Creando..." : "Crear Cliente"
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormRealCliente;

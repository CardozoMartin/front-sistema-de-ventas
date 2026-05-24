import { useNavigate } from "react-router-dom";
import { useUsers, useDeleteUser } from "../../hooks/useUsers";
import { useAuthSession } from "../../store/useAuthSession";
import { useMemo } from "react";
import { Trash2, Edit, Users, Plus } from "lucide-react";
import Swal from "../../utils/swalTheme.ts";
import { swalCustomClass, swalBackdrop } from "../../utils/swalTheme";
import { DataGrid } from "../../shared/ui/DataGrid";
import type { ColumnDef } from "@tanstack/react-table";

interface Empleado {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

const EmpleadosPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthSession();
  const isAdmin = currentUser?.role === 'admin';

  const { data: users = [], isLoading, error } = useUsers();
  const deleteUserMutation = useDeleteUser();

  const handleEdit = (userId: string) => {
    navigate(`/dashboard/empleados/editar/${userId}`);
  };

  const handleDelete = (userId: string, userName: string) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar al empleado ${userName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      customClass: {
        ...swalCustomClass,
        confirmButton: 'px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors mr-2',
      },
      backdrop: swalBackdrop,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUserMutation.mutate(userId, {
          onSuccess: () => {
            Swal.fire({
              title: "Eliminado",
              text: "El empleado ha sido eliminado correctamente",
              icon: "success",
              buttonsStyling: false,
              customClass: swalCustomClass,
              backdrop: swalBackdrop,
            });
          },
          onError: (error: any) => {
            Swal.fire({
              title: "Error",
              text: error.message || "Error al eliminar el empleado",
              icon: "error",
              buttonsStyling: false,
              customClass: swalCustomClass,
              backdrop: swalBackdrop,
            });
          },
        });
      }
    });
  };

  const columns = useMemo<ColumnDef<Empleado>[]>(() => [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <span className="font-medium text-neutral-900">{row.original.name}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-neutral-600">{row.original.email}</span>,
    },
    {
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => (
        <span className={row.original.role === 'admin' ? "badge-success font-semibold" : "badge-neutral font-semibold"}>
          {row.original.role || "Usuario"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center justify-center gap-1.5">
            {isAdmin ? (
              <>
                <button
                  onClick={() => handleEdit(user.id.toString())}
                  className="icon-btn hover:bg-neutral-100 hover:text-neutral-900"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(user.id.toString(), user.name)}
                  disabled={deleteUserMutation.isPending}
                  className="icon-btn hover:bg-red-50 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </>
            ) : (
              <span className="text-neutral-400 text-xs font-medium">—</span>
            )}
          </div>
        );
      },
    },
  ], [isAdmin, handleEdit, handleDelete, deleteUserMutation.isPending]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sm text-neutral-500">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="badge-danger p-4 rounded-lg flex items-center justify-center gap-2">
        <p className="text-sm font-semibold">Error al cargar los empleados: {error instanceof Error ? error.message : "Error desconocido"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center justify-center p-2 bg-neutral-100 text-neutral-900 rounded-md mb-2">
            <Users size={20} strokeWidth={1.5} />
          </div>
          <h1 className="page-title">Gestión de Empleados</h1>
          <p className="page-subtitle">Administra el personal y sus roles</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/dashboard/empleados/agregar")}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus size={16} strokeWidth={1.75} />
            Agregar Empleado
          </button>
        )}
      </div>

      <DataGrid
        data={users as any}
        columns={columns}
        searchPlaceholder="Buscar por nombre o email..."
      />
    </div>
  );
};

export default EmpleadosPage;

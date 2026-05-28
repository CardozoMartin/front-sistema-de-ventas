import { useNavigate } from "react-router-dom";
import { useClients, useDeleteClient, usePayClientDebt } from "../../hooks/useClients";
import { useAuthSession } from "../../store/useAuthSession";
import { useMemo } from "react";
import { Trash2, Edit, CreditCard, Phone, Mail, DollarSign, Users, Plus } from "lucide-react";
import Swal from "../../utils/swalTheme.ts";
import { swalCustomClass, swalBackdrop } from "../../utils/swalTheme";
import { DataGrid } from "../../shared/ui/DataGrid";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useState } from "react";
import { ClientDebtDetailsModal } from "../../components/Clientes/ClientDebtDetailsModal";

// Añadimos una interfaz básica para el tipado de Cliente si no está importada
interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  maxCredit?: number;
  debt: number;
}

const RealClientesPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthSession();
  const isAdmin = currentUser?.role === 'admin';

  const [selectedClientForDetails, setSelectedClientForDetails] = useState<{ id: string, name: string } | null>(null);

  const { data: clients = [], isLoading, error } = useClients();
  const deleteClientMutation = useDeleteClient();
  const payDebtMutation = usePayClientDebt();

  const handleEdit = (clientId: string) => {
    navigate(`/dashboard/clientes/editar/${clientId}`);
  };

  const handleDelete = (clientId: string, clientName: string) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar al cliente ${clientName}?`,
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
        deleteClientMutation.mutate(clientId, {
          onSuccess: () => {
            Swal.fire({
              title: "Eliminado",
              text: "El cliente ha sido eliminado correctamente",
              icon: "success",
              buttonsStyling: false,
              customClass: swalCustomClass,
              backdrop: swalBackdrop,
            });
          },
          onError: (error: any) => {
            Swal.fire({
              title: "Error",
              text: error.message || "Error al eliminar el cliente",
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

  const handlePayDebt = (clientId: string, clientName: string, currentDebt: number) => {
    if (currentDebt <= 0) {
      Swal.fire({
        title: "Sin deuda",
        text: "Este cliente no registra deuda actual",
        icon: "info",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
      return;
    }

    Swal.fire({
      title: `Registrar Pago - ${clientName}`,
      html: `
        <div class="text-left font-medium text-neutral-500 mb-3 text-xs uppercase tracking-wide">
          Deuda actual: <span class="font-semibold text-red-600">$${currentDebt.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
        </div>
        <input type="number" id="pay-amount" class="app-input py-2.5" placeholder="Monto a pagar ($)" min="1" max="${currentDebt}" step="0.01">
      `,
      showCancelButton: true,
      confirmButtonText: "Registrar Pago",
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      customClass: swalCustomClass,
      backdrop: swalBackdrop,
      preConfirm: () => {
        const input = document.getElementById("pay-amount") as HTMLInputElement;
        const amount = parseFloat(input?.value);
        if (isNaN(amount) || amount <= 0) {
          Swal.showValidationMessage("Por favor, ingresá un monto de pago válido");
          return false;
        }
        if (amount > currentDebt) {
          Swal.showValidationMessage(`El pago no puede superar la deuda de $${currentDebt}`);
          return false;
        }
        return amount;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const amount = result.value;
        payDebtMutation.mutate(
          { id: clientId, amount },
          {
            onSuccess: () => {
              Swal.fire({
                title: "Pago Registrado",
                text: `Se registró el pago de $${amount} correctamente`,
                icon: "success",
                buttonsStyling: false,
                customClass: swalCustomClass,
                backdrop: swalBackdrop,
              });
            },
            onError: (error: any) => {
              Swal.fire({
                title: "Error",
                text: error.message || "Error al registrar el pago",
                icon: "error",
                buttonsStyling: false,
                customClass: swalCustomClass,
                backdrop: swalBackdrop,
              });
            }
          }
        );
      }
    });
  };

  const columns = useMemo<ColumnDef<Client>[]>(() => [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => <span className="font-medium text-neutral-900">{row.original.name}</span>,
    },
    {
      id: "contact",
      header: "Contacto",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="space-y-1">
            {c.phone && (
              <span className="flex items-center gap-1.5 text-xs text-neutral-600">
                <Phone size={12} className="text-neutral-400" />
                {c.phone}
              </span>
            )}
            {c.email && (
              <span className="flex items-center gap-1.5 text-xs text-neutral-600">
                <Mail size={12} className="text-neutral-400" />
                {c.email}
              </span>
            )}
            {!c.phone && !c.email && (
              <span className="text-neutral-400 text-xs">Sin datos de contacto</span>
            )}
          </div>
        );
      },
      filterFn: (row, _id, filterValue) => {
        const c = row.original;
        const val = filterValue.toLowerCase();
        return (c.phone?.toLowerCase().includes(val) ?? false) || (c.email?.toLowerCase().includes(val) ?? false) || (c.name?.toLowerCase().includes(val) ?? false);
      }
    },
    {
      accessorKey: "maxCredit",
      header: "Crédito Máximo",
      cell: ({ row }) => {
        const maxCredit = row.original.maxCredit;
        return maxCredit && maxCredit > 0 ? (
          <span className="font-medium text-neutral-900">
            ${maxCredit.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-neutral-400 text-xs font-normal">Sin límite</span>
        );
      },
    },
    {
      accessorKey: "debt",
      header: "Deuda Actual",
      cell: ({ row }) => {
        const debt = row.original.debt;
        return debt > 0 ? (
          <span className="badge-danger font-semibold">
            <DollarSign size={10} className="mr-0.5 inline-block" />
            ${debt.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="badge-success font-semibold">Al día</span>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => setSelectedClientForDetails({ id: client.id, name: client.name })}
              className="icon-btn hover:bg-blue-50 hover:text-blue-700"
              title="Ver Detalle de Cuenta"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => handlePayDebt(client.id, client.name, client.debt)}
              disabled={client.debt <= 0}
              className="icon-btn hover:bg-accent-50 hover:text-accent-700 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Registrar Pago"
            >
              <CreditCard size={16} />
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => handleEdit(client.id)}
                  className="icon-btn hover:bg-neutral-100 hover:text-neutral-900"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(client.id, client.name)}
                  disabled={deleteClientMutation.isPending}
                  className="icon-btn hover:bg-red-50 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ], [isAdmin, handlePayDebt, handleEdit, handleDelete, deleteClientMutation.isPending]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sm text-neutral-500">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="badge-danger p-4 rounded-lg flex items-center justify-center gap-2">
        <p className="text-sm font-semibold">Error al cargar los clientes: {error instanceof Error ? error.message : "Error desconocido"}</p>
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
          <h1 className="page-title">Gestión de Clientes</h1>
          <p className="page-subtitle">Control de fiados y cuentas corrientes</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/dashboard/clientes/agregar")}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus size={16} strokeWidth={1.75} />
            Agregar Cliente
          </button>
        )}
      </div>

      <DataGrid
        data={clients}
        columns={columns}
        searchPlaceholder="Buscar por nombre, teléfono o email..."
      />

      <ClientDebtDetailsModal 
        show={!!selectedClientForDetails}
        onClose={() => setSelectedClientForDetails(null)}
        clientId={selectedClientForDetails?.id || ""}
        clientName={selectedClientForDetails?.name || ""}
      />
    </div>
  );
};

export default RealClientesPage;

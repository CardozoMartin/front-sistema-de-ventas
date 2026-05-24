import { useMemo } from "react";
import { Edit, Trash2, Power, PowerOff } from "lucide-react";
import Swal from "../../utils/swalTheme.ts";
import { useNavigate } from "react-router-dom";
import { useDeleteProduct, useDeactivateProduct } from "../../hooks";
import type { Product } from "../../services/types";
import { formatCurrency } from "../../utils/formatCurrency";
import { analyzeProductPricing } from "../../utils/productPricing";
import { formatStockDisplay } from "../../utils/formatQuantity";
import { swalCustomClass, swalBackdrop } from "../../utils/swalTheme";
import { DataGrid } from "../../shared/ui/DataGrid";
import type { ColumnDef } from "@tanstack/react-table";

interface TableProductProps {
  productos: { products: Product[]; pagination: any } | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const TableProduct = ({ productos, isLoading }: TableProductProps) => {
  const navigate = useNavigate();
  const deleteProduct = useDeleteProduct();
  const deactivateProduct = useDeactivateProduct();

  const products = productos?.products ?? [];

  const handleEditClick = (product: Product) => {
    Swal.fire({
      title: `¿Editar ${product.name}?`,
      text: "Serás redirigido al formulario de edición",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, editar",
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      customClass: swalCustomClass,
      backdrop: swalBackdrop,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/dashboard/productos/agregar", { state: { product } });
      }
    });
  };

  const handleDeleteClick = (id: string, name: string) => {
    Swal.fire({
      title: `¿Eliminar ${name}?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      customClass: {
        ...swalCustomClass,
        confirmButton: "px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors mr-2",
      },
      backdrop: swalBackdrop,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProduct.mutate(id, {
          onSuccess: () => Swal.fire("Eliminado", "El producto ha sido eliminado", "success"),
          onError: (error: any) => Swal.fire("Error", error.response?.data?.message || "Error al eliminar", "error"),
        });
      }
    });
  };

  const handleToggleStatus = (id: string, isActive: boolean, name: string) => {
    Swal.fire({
      title: `¿${isActive ? "Desactivar" : "Activar"} ${name}?`,
      text: `El producto será ${isActive ? "desactivado" : "activado"}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${isActive ? "desactivar" : "activar"}`,
      cancelButtonText: "Cancelar",
      buttonsStyling: false,
      customClass: swalCustomClass,
      backdrop: swalBackdrop,
    }).then((result) => {
      if (result.isConfirmed) {
        deactivateProduct.mutate(id, {
          onSuccess: () => Swal.fire("Actualizado", `El producto ha sido ${isActive ? "desactivado" : "activado"}`, "success"),
          onError: (error: any) => Swal.fire("Error", error.response?.data?.message || "Error", "error"),
        });
      }
    });
  };

  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      accessorKey: "name",
      header: "Producto",
      cell: ({ row }) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, color: "#111" }}>{row.original.name}</span>
          <span style={{ fontSize: 10, color: "#888" }}>Cód: {row.original.code}</span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => (
        <span style={{ fontSize: 10, background: "#f5f5f5", color: "#555", padding: "2px 6px", borderRadius: 2 }}>
          {row.original.category || 'Ninguna'}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => {
        const m = analyzeProductPricing(row.original);
        return (
          <div style={{ fontWeight: 500, color: "#111" }}>
            {formatCurrency(m.saleUnitPrice)}
            {m.isWeight && <span style={{ fontSize: 9, color: "#aaa", marginLeft: 2 }}>/ kg</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "costPrice",
      header: "Costo",
      cell: ({ row }) => {
        const m = analyzeProductPricing(row.original);
        return (
          <div style={{ color: "#666" }}>
            {formatCurrency(m.costUnitPrice)}
            {m.isWeight && <span style={{ fontSize: 9, color: "#aaa", marginLeft: 2 }}>/ kg</span>}
          </div>
        );
      },
    },
    {
      id: "margin",
      header: "Margen",
      cell: ({ row }) => {
        const m = analyzeProductPricing(row.original);
        return (
          <span style={{ fontSize: 10, fontWeight: 600, color: m.sellsAtLoss ? "#c62828" : "#2e7d32", background: m.sellsAtLoss ? "#fdecea" : "#e8f5e9", padding: "2px 6px", borderRadius: 2 }}>
            {m.marginPct.toFixed(1)}%
          </span>
        );
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const p = row.original;
        const sColor = p.stock > 10 ? "#2e7d32" : p.stock > 0 ? "#e65100" : "#c62828";
        return (
          <span style={{ fontWeight: 600, color: sColor }}>
            {formatStockDisplay(p.stock, p.unitType)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const s = row.original.status || (row.original.active ? 'activo' : 'inactivo');
        const active = s === 'activo';
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#16a34a" : "#dc2626" }} />
            <span style={{ fontSize: 10, color: "#555", textTransform: "capitalize" }}>{s.replace('_', ' ')}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
            <button onClick={(e) => { e.stopPropagation(); handleEditClick(p); }} style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", color: "#666" }} title="Editar">
              <Edit size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(p.id, p.active, p.name); }} style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", color: p.active ? "#666" : "#e65100" }} title={p.active ? "Desactivar" : "Activar"}>
              {p.active ? <PowerOff size={14} /> : <Power size={14} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(p.id, p.name); }} style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", color: "#c62828" }} title="Eliminar">
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ], [navigate, deleteProduct, deactivateProduct]);

  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div className="spinner" /></div>;
  }

  const renderCard = (p: Product) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 600, color: "#111", fontSize: 13 }}>{p.name}</div>
          <div style={{ fontSize: 10, color: "#888" }}>Cód: {p.code} · {p.category || 'Ninguna'}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
            <button onClick={(e) => { e.stopPropagation(); handleEditClick(p); }} style={{ padding: 4, border: "1px solid #eee", borderRadius: 3, background: "#fff", cursor: "pointer", color: "#666" }}>
              <Edit size={12} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(p.id, p.active, p.name); }} style={{ padding: 4, border: "1px solid #eee", borderRadius: 3, background: "#fff", cursor: "pointer", color: "#666" }}>
              {p.active ? <PowerOff size={12} /> : <Power size={12} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(p.id, p.name); }} style={{ padding: 4, border: "1px solid #eee", borderRadius: 3, background: "#fff", cursor: "pointer", color: "#c62828" }}>
              <Trash2 size={12} />
            </button>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, borderTop: "1px solid #f5f5f5", paddingTop: 8 }}>
        <div>
          <span style={{ color: "#888" }}>Venta: </span><span style={{ fontWeight: 600, color: "#111" }}>{formatCurrency(p.price)}</span>
        </div>
        <div>
          <span style={{ color: "#888" }}>Stock: </span><span style={{ fontWeight: 600, color: p.stock > 0 ? "#111" : "#c62828" }}>{p.stock}</span>
        </div>
      </div>
    </div>
  );

  return (
    <DataGrid 
      data={products} 
      columns={columns} 
      searchPlaceholder="Buscar producto por nombre o código..." 
      renderCard={renderCard}
    />
  );
};

export default TableProduct;
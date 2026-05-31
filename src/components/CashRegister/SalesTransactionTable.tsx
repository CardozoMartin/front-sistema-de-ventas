import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Sale } from "../../services/types";
import { ChevronDown, ChevronUp, ShoppingBag, Package } from "lucide-react";
import React, { useState } from "react";
import { formatCurrency } from "../../utils/formatCurrency";

interface SalesTransactionTableProps {
  sales: Sale[];
  isLoading?: boolean;
}

const SalesTransactionTable = ({ sales, isLoading = false }: SalesTransactionTableProps) => {
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "40px" }}><div className="spinner"></div></div>;
  }

  if (sales.length === 0) {
    return <div style={{ textAlign: "center", padding: "40px", fontSize: 12, color: "#aaa" }}>No hay ventas registradas para esta caja</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pagado": return { bg: "#e8f5e9", color: "#2e7d32" };
      case "pendiente": return { bg: "#fff3e0", color: "#e65100" };
      case "cancelado": return { bg: "#fdecea", color: "#c62828" };
      default: return { bg: "#f0f0f0", color: "#555" };
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = { efectivo: "Efectivo", transferencia: "Transferencia", cuenta_corriente: "C. Corriente" };
    return labels[method] || method;
  };

  const toggleExpand = (id: string) => setExpandedSaleId(current => current === id ? null : id);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 600 }}>
        <thead style={{ background: "#fafafa" }}>
          <tr>
            {["Horario", "Vendedor", "Productos", "Total", "Método", "Estado", ""].map((h, i) => (
              <th key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", padding: "6px 16px", textAlign: i >= 6 ? "right" : "left", borderBottom: "1px solid #f0f0f0" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => {
            const isExpanded = expandedSaleId === sale.id;
            const statusStyle = getStatusColor(sale.status);
            return (
              <React.Fragment key={sale.id}>
                <tr style={{ background: isExpanded ? "#fafafa" : "#fff", borderBottom: isExpanded ? "none" : "1px solid #f5f5f5" }} className="hover:bg-neutral-50 transition-colors">
                  <td style={{ padding: "9px 16px", fontSize: 11, color: "#888" }}>
                    {format(new Date(sale.createdAt), "HH:mm", { locale: es })}
                  </td>
                  <td style={{ padding: "9px 16px", fontSize: 12, fontWeight: 600, color: "#111" }}>
                    {typeof sale.seller === "string" ? sale.seller : (sale.seller as any)?.name || "-"}
                  </td>
                  <td style={{ padding: "9px 16px", fontSize: 12, color: "#555", display: "flex", alignItems: "center", gap: 6 }}>
                    <ShoppingBag size={12} color="#aaa" />
                    {sale.notes === 'ABONO_DE_DEUDA' ? 'Abono deuda' : (sale.details && sale.details.length > 0 ? `${sale.details.length} prod.` : "-")}
                  </td>
                  <td style={{ padding: "9px 16px", fontSize: 12, fontWeight: 600, color: "#111" }}>
                    {formatCurrency(sale.total)}
                  </td>
                  <td style={{ padding: "9px 16px", fontSize: 11, color: "#555" }}>
                    {getPaymentMethodLabel(sale.paymentMethod)}
                  </td>
                  <td style={{ padding: "9px 16px" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: statusStyle.color, background: statusStyle.bg, padding: "2px 6px", borderRadius: 2 }}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: "9px 16px", textAlign: "right" }}>
                    {((sale.details && sale.details.length > 0) || sale.notes === 'ABONO_DE_DEUDA') && (
                      <button onClick={() => toggleExpand(sale.id)} style={{ padding: "2px 6px", fontSize: 10, fontWeight: 600, background: isExpanded ? "#111" : "#f0f0f0", color: isExpanded ? "#fff" : "#555", border: "none", borderRadius: 3, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {isExpanded ? 'Ocultar' : 'Ver'}
                      </button>
                    )}
                  </td>
                </tr>
                {isExpanded && (sale.details || sale.notes === 'ABONO_DE_DEUDA') && (
                  <tr>
                    <td colSpan={7} style={{ padding: 0, borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                      <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
                        {sale.notes === 'ABONO_DE_DEUDA' ? (
                          <div style={{ display: "flex", alignItems: "start", gap: 8, background: "#fff", padding: "16px", borderRadius: 4, border: "1px solid #e8e8e8" }}>
                            <div style={{ color: "#2e7d32", marginTop: 2 }}><ShoppingBag size={16} /></div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{sale.details?.[0]?.productName || "Abono a deuda de cliente"}</div>
                              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Este registro corresponde a un pago de cuenta corriente y no incluye productos físicos.</div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                              <Package size={14} color="#888" />
                              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555" }}>Productos en esta venta</div>
                            </div>
                            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                                <thead style={{ background: "#fafafa" }}>
                                  <tr>
                                    {["Producto", "Cantidad", "Precio Unit.", "Subtotal"].map((h, i) => (
                                      <th key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", padding: "6px 16px", textAlign: i > 0 ? "right" : "left", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {sale.details!.map((detail, idx) => (
                                    <tr key={detail.id || idx} style={{ borderBottom: idx < sale.details!.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                                      <td style={{ padding: "6px 16px", fontSize: 11, fontWeight: 600, color: "#111" }}>{detail.productName}</td>
                                      <td style={{ padding: "6px 16px", fontSize: 11, color: "#888", textAlign: "right" }}>
                                        {detail.quantity} {detail.unitType === "kilogramo" ? "kg" : "un."}
                                      </td>
                                      <td style={{ padding: "6px 16px", fontSize: 11, color: "#555", textAlign: "right", fontWeight: 500 }}>
                                        {formatCurrency(detail.unitPrice)}
                                      </td>
                                      <td style={{ padding: "6px 16px", fontSize: 11, fontWeight: 600, color: "#111", textAlign: "right" }}>
                                        {formatCurrency(detail.subtotal)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTransactionTable;

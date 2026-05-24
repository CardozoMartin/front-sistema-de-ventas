import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { CashRegister } from "../../services/types";
import { Eye, Edit2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

interface CashRegisterTableProps {
  cashRegisters: CashRegister[];
  isLoading?: boolean;
  onViewDetails?: (cashRegister: CashRegister) => void;
  onEdit?: (cashRegister: CashRegister) => void;
}

const CashRegisterTable = ({ cashRegisters, isLoading = false, onViewDetails, onEdit }: CashRegisterTableProps) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (cashRegisters.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", fontSize: 12, color: "#aaa" }}>
        No hay cajas registradas
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 600 }}>
        <thead style={{ background: "#fafafa" }}>
          <tr>
            {["Estado", "Apertura", "Monto Inicial", "Monto Final", "Total Ventas", "Diferencia", ""].map((header, idx) => (
              <th
                key={header}
                style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb",
                  padding: "6px 16px", textAlign: idx >= 6 ? "right" : "left", borderBottom: "1px solid #f0f0f0"
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cashRegisters.map((cashRegister) => (
            <tr key={cashRegister.id} style={{ borderBottom: "1px solid #f5f5f5" }} className="hover:bg-neutral-50 transition-colors">
              <td style={{ padding: "9px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: cashRegister.status === "abierta" ? "#16a34a" : "#aaa" }} />
                  <span style={{ fontSize: 10, color: "#555", textTransform: "capitalize" }}>
                    {cashRegister.status === "abierta" ? "Abierta" : "Cerrada"}
                  </span>
                </div>
              </td>
              <td style={{ padding: "9px 16px", fontSize: 11, color: "#555", fontWeight: 500 }}>
                {format(new Date(cashRegister.openedAt), "dd/MM/yyyy HH:mm", { locale: es })}
              </td>
              <td style={{ padding: "9px 16px", fontSize: 12, fontWeight: 500, color: "#111" }}>
                {formatCurrency(cashRegister.initialCash)}
              </td>
              <td style={{ padding: "9px 16px", fontSize: 12, fontWeight: 500, color: "#111" }}>
                {cashRegister.finalCash !== undefined && cashRegister.finalCash !== null
                  ? formatCurrency(cashRegister.finalCash)
                  : <span style={{ color: "#aaa" }}>-</span>}
              </td>
              <td style={{ padding: "9px 16px", fontSize: 12, fontWeight: 600, color: "#111" }}>
                {formatCurrency(cashRegister.totalSales)}
              </td>
              <td style={{ padding: "9px 16px", fontSize: 12, fontWeight: 600, color: cashRegister.difference !== undefined && cashRegister.difference !== null ? (Math.abs(cashRegister.difference) < 0.01 ? "#16a34a" : cashRegister.difference > 0 ? "#111" : "#c62828") : "#aaa" }}>
                {cashRegister.difference !== undefined && cashRegister.difference !== null ? (
                  <>
                    {cashRegister.difference > 0 ? "+" : ""}
                    {formatCurrency(cashRegister.difference)}
                  </>
                ) : (
                  "-"
                )}
              </td>
              <td style={{ padding: "9px 16px", textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(cashRegister)}
                      style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", color: "#666" }}
                      title="Ver detalles"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  {onEdit && cashRegister.status === "abierta" && (
                    <button
                      onClick={() => onEdit(cashRegister)}
                      style={{ padding: 4, background: "transparent", border: "none", cursor: "pointer", color: "#e65100" }}
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CashRegisterTable;

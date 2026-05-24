import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CashMovement } from '../../services/types';
import { formatCurrency } from '../../utils/formatCurrency';

interface CashMovementsTableProps {
  movements: CashMovement[];
  isLoading?: boolean;
}

const CashMovementsTable = ({ movements, isLoading = false }: CashMovementsTableProps) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", fontSize: 12, color: "#aaa" }}>
        No hay movimientos de efectivo
      </div>
    );
  }

  const totalRetiros = movements.filter(m => m.type === 'retiro').reduce((sum, m) => sum + m.amount, 0);
  const totalIngresos = movements.filter(m => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 400 }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              {["Tipo", "Hora", "Monto", "Motivo", "Notas"].map((h) => (
                <th key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", padding: "6px 16px", textAlign: "left", borderBottom: "1px solid #f0f0f0" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id} style={{ borderBottom: "1px solid #f5f5f5" }} className="hover:bg-neutral-50 transition-colors">
                <td style={{ padding: "9px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: movement.type === 'retiro' ? "#c62828" : "#16a34a" }} />
                    <span style={{ fontSize: 10, color: "#555", textTransform: "capitalize", fontWeight: 600 }}>{movement.type}</span>
                  </div>
                </td>
                <td style={{ padding: "9px 16px", fontSize: 11, color: "#888" }}>
                  {format(new Date(movement.createdAt), 'HH:mm', { locale: es })}
                </td>
                <td style={{ padding: "9px 16px", fontSize: 12, fontWeight: 600, color: movement.type === 'retiro' ? "#c62828" : "#16a34a" }}>
                  {movement.type === 'retiro' ? '-' : '+'}{formatCurrency(movement.amount)}
                </td>
                <td style={{ padding: "9px 16px", fontSize: 11, color: "#111" }}>
                  {movement.reason}
                </td>
                <td style={{ padding: "9px 16px", fontSize: 11, color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {movement.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: 16, background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ padding: "8px 12px", background: "#fff", border: "1px solid #fdecea", borderRadius: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c62828" }}>Total Retiros</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#c62828", marginTop: 2 }}>-{formatCurrency(totalRetiros)}</div>
        </div>
        <div style={{ padding: "8px 12px", background: "#fff", border: "1px solid #e8f5e9", borderRadius: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#16a34a" }}>Total Ingresos</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#16a34a", marginTop: 2 }}>+{formatCurrency(totalIngresos)}</div>
        </div>
      </div>
    </div>
  );
};

export default CashMovementsTable;

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Plus, X, ChevronDown, ChevronUp, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useOpenCashRegister, useOpenCashRegisterMutation, useCloseCashRegister, useCashRegisters } from "../../hooks/useCashRegister";
import { useSalesByCashRegister } from "../../hooks/useSales";
import { useCashMovements } from "../../hooks/useCashMovements";
import { useAuthSession } from "../../store/useAuthSession";
import { formatCurrency } from "../../utils/formatCurrency";
import OpenCashForm from "../../components/CashRegister/OpenCashForm";
import CloseCashForm from "../../components/CashRegister/CloseCashForm";
import CashRegisterTable from "../../components/CashRegister/CashRegisterTable";
import SalesTransactionTable from "../../components/CashRegister/SalesTransactionTable";
import CashMovementsTable from "../../components/CashRegister/CashMovementsTable";
import CashMovementModal from "../../components/CashRegister/CashMovementModal";
import TablePagination from "../../components/ui/TablePagination";
import type { CashRegister } from "../../services/types";
import Swal from "../../utils/swalTheme";

// --- Formateadores
const fmt = (n: number) => formatCurrency(n);

// --- UI Components 
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: 8, marginTop: 20 }}>
    {children}
  </div>
);

const HeroCard = ({ label, value, sub, accent }: any) => (
  <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderLeft: accent ? `3px solid ${accent}` : "1px solid #e8e8e8", borderRadius: 4, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa" }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 300, color: "#111", letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: "#aaa" }}>{sub}</div>}
  </div>
);

const MetaCell = ({ label, value, sub, danger, warn, accent }: any) => (
  <div style={{ background: "#f7f7f7", borderRadius: 4, padding: "10px 14px", border: accent ? `1px solid ${accent}` : "none" }}>
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 500, color: danger ? "#c62828" : warn ? "#bf6000" : "#111", letterSpacing: "-0.01em" }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{sub}</div>}
  </div>
);

const CashRegisterPage = () => {
  const { user: currentUser } = useAuthSession();
  const isAdmin = currentUser?.role === 'admin';
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegister | null>(null);
  const [viewCashRegister, setViewCashRegister] = useState<CashRegister | null>(null);

  // Hooks
  const { data: openCashRegister, isLoading: loadingOpenCash } = useOpenCashRegister();
  const { mutate: openCashMutate, isPending: openingCash } = useOpenCashRegisterMutation();
  const { mutate: closeCashMutate, isPending: closingCash } = useCloseCashRegister();
  const { data: cashRegisters, isLoading: loadingCashRegisters } = useCashRegisters();
  const { data: expandedSales, isLoading: loadingExpandedSales } = useSalesByCashRegister(viewCashRegister?.id || null, !!viewCashRegister);
  const { data: movements, isLoading: loadingMovements } = useCashMovements(openCashRegister?.id || null, !!openCashRegister);

  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Años disponibles
  const availableYears = useMemo(() => {
    if (!cashRegisters) return [];
    const years = new Set<number>();
    cashRegisters.forEach(reg => years.add(new Date(reg.openedAt).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [cashRegisters]);

  const initializeYear = useCallback(() => {
    if (availableYears.length > 0 && selectedYear === null) setSelectedYear(availableYears[0]);
  }, [availableYears, selectedYear]);

  useEffect(() => { initializeYear(); }, [initializeYear]);

  const cashRegistersByYear = useMemo(() => {
    if (!cashRegisters || selectedYear === null) return [];
    return cashRegisters.filter(reg => new Date(reg.openedAt).getFullYear() === selectedYear);
  }, [cashRegisters, selectedYear]);

  const groupedCashRegisters = useMemo(() => {
    const groups: Record<string, CashRegister[]> = {};
    cashRegistersByYear.forEach(reg => {
      const monthKey = format(new Date(reg.openedAt), "MMMM", { locale: es });
      const capitalizedMonthKey = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
      if (!groups[capitalizedMonthKey]) groups[capitalizedMonthKey] = [];
      groups[capitalizedMonthKey].push(reg);
    });
    return groups;
  }, [cashRegistersByYear]);

  const sortedMonths = useMemo(() => {
    return Object.keys(groupedCashRegisters).sort((a, b) => {
      const dateA = new Date(groupedCashRegisters[a][0].openedAt).getTime();
      const dateB = new Date(groupedCashRegisters[b][0].openedAt).getTime();
      return dateB - dateA;
    });
  }, [groupedCashRegisters]);

  const expandFirstMonth = useCallback(() => {
    setExpandedMonth(sortedMonths.length > 0 ? sortedMonths[0] : null);
  }, [sortedMonths]);

  useEffect(() => { expandFirstMonth(); }, [expandFirstMonth]);

  const handleViewDetails = (cashRegister: CashRegister) => {
    setViewCashRegister((current) => current?.id === cashRegister.id ? null : cashRegister);
  };

  const handleOpenCash = async (data: { initialCash: number; notes?: string }) => {
    return new Promise<void>((resolve, reject) => {
      openCashMutate(data, { onSuccess: () => resolve(), onError: (error) => reject(error) });
    });
  };

  const handleCloseCash = async (data: { cashCounted: number; denominationCount?: Record<string, number>; notes?: string; }) => {
    if (!selectedCashRegister) throw new Error("No hay caja seleccionada");
    return new Promise<void>((resolve, reject) => {
      closeCashMutate(
        { id: selectedCashRegister.id, data: { cashCounted: data.cashCounted, denominationCount: data.denominationCount, notes: data.notes } },
        { onSuccess: () => { setSelectedCashRegister(null); resolve(); }, onError: (error) => reject(error) }
      );
    });
  };

  const handleOpenFormClick = () => {
    if (openCashRegister) {
      Swal.fire({ icon: 'error', title: 'Atención', text: 'Ya hay una caja abierta. Ciérrala primero.', confirmButtonText: 'Entendido' });
      return;
    }
    setShowOpenForm(true);
  };

  const currentDateStr = new Date().toLocaleDateString("es-AR", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', 'Helvetica Neue', Arial, sans-serif", background: "#f4f4f2", minHeight: "100%", padding: "24px 28px", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111", letterSpacing: "-0.01em" }}>Gestión de Cajas</div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{currentDateStr}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isAdmin && (
            <button
              onClick={() => {
                if (!openCashRegister) {
                   Swal.fire({ icon: 'warning', title: 'Caja Cerrada', text: 'Debes abrir la caja primero.' });
                   return;
                }
                setShowMovementModal(true);
              }}
              style={{ fontSize: 11, fontWeight: 500, padding: "6px 14px", borderRadius: 3, border: "1px solid #111", background: "transparent", color: "#111", cursor: "pointer" }}
            >
              Ingreso / Retiro
            </button>
          )}
          <button
            onClick={() => {
              if (openCashRegister) { setSelectedCashRegister(openCashRegister); setShowCloseForm(true); } 
              else { handleOpenFormClick(); }
            }}
            disabled={(!!openCashRegister && closingCash) || (!openCashRegister && openingCash)}
            style={{
              fontSize: 11, fontWeight: 500, padding: "6px 14px", borderRadius: 3, cursor: "pointer", border: "none", display: "flex", alignItems: "center", gap: 6,
              background: openCashRegister ? "#c62828" : "#111", color: "#fff"
            }}
          >
            {openCashRegister ? <><X size={14} />{closingCash ? 'Cerrando...' : 'Cerrar Caja'}</> : <><Plus size={14} />Abrir Caja</>}
          </button>
        </div>
      </div>

      {/* Caja Abierta */}
      {openCashRegister ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.1em" }}>Turno Activo</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr)) minmax(0,1.1fr)", gap: 8, marginBottom: 8 }} className="max-lg:grid-cols-2 max-sm:grid-cols-1">
            <HeroCard
              label="Efectivo Esperado"
              value={fmt(openCashRegister.expectedCash ?? (openCashRegister.initialCash + openCashRegister.totalCash + (openCashRegister.totalDebtPayments || 0) - (openCashRegister.totalWithdrawals || 0) + (openCashRegister.totalDeposits || 0)))}
              sub="Lo que debería haber en caja"
              accent="#111"
            />
            <HeroCard
              label="Ingresos Efectivo"
              value={fmt(openCashRegister.totalCash)}
              sub="Solo ventas cobradas en efectivo"
              accent="#16a34a"
            />
            <HeroCard
              label="Ingresos Totales"
              value={fmt(openCashRegister.totalSales || 0)}
              sub="EF + Transferencias + CC"
              accent="#16a34a"
            />

            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "#888" }}>Fondo Inicial</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#111" }}>{fmt(openCashRegister.initialCash)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: "#888" }}>Total Ingresos Extras</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a" }}>+{fmt(openCashRegister.totalDeposits || 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: "#888" }}>Total Retiros</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#c62828" }}>-{fmt(openCashRegister.totalWithdrawals || 0)}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8, marginBottom: 16 }}>
            <MetaCell label="Costo Mercadería" value={fmt(openCashRegister.totalCost || 0)} sub="Costo de las ventas" />
            <MetaCell label="Ganancia Bruta de Sesión" value={fmt(openCashRegister.totalProfit ?? ((openCashRegister.totalSales || 0) - (openCashRegister.totalCost || 0)))} sub={`Margen ${((openCashRegister.totalSales || 0) > 0 ? (((openCashRegister.totalProfit ?? ((openCashRegister.totalSales || 0) - (openCashRegister.totalCost || 0))) / (openCashRegister.totalSales || 0)) * 100).toFixed(1) : '0.0')}%`} accent="#e8e8e8" />
          </div>

          {movements && movements.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0", fontSize: 11, fontWeight: 600, color: "#111", letterSpacing: "-0.01em" }}>
                Registro de Movimientos de Efectivo
              </div>
              <CashMovementsTable movements={movements} isLoading={loadingMovements} />
            </div>
          )}
        </div>
      ) : (
        !loadingOpenCash && (
          <div style={{ background: "#fffbf0", border: "1px solid #f0d080", borderLeft: "3px solid #d97706", borderRadius: 4, padding: "8px 14px", fontSize: 11, color: "#92400e", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700 }}>No hay caja abierta</span>
            <span style={{ color: "#fcd34d", fontSize: 10 }}>·</span>
            <span>Abre una nueva caja para comenzar a registrar ventas o movimientos.</span>
          </div>
        )
      )}

      {/* Historial de Cajas - Solo Administrador */}
      {isAdmin && (
        <>
          <SectionLabel>Historial de Cajas</SectionLabel>
          
          {sortedMonths.length === 0 && !loadingCashRegisters && (
            <div style={{ padding: 40, textAlign: "center", fontSize: 12, color: "#aaa", background: "#fff", border: "1px dashed #ddd", borderRadius: 4 }}>
              No hay cajas registradas aún
            </div>
          )}

          {loadingCashRegisters && <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div className="spinner"></div></div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sortedMonths.map((month) => {
              const isExpanded = expandedMonth === month;
              const monthRegisters = groupedCashRegisters[month];
              
              return (
                <div key={month} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden" }}>
                  <button
                    onClick={() => setExpandedMonth(isExpanded ? null : month)}
                    style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: isExpanded ? "#fafafa" : "#fff", border: "none", borderBottom: isExpanded ? "1px solid #f0f0f0" : "none", cursor: "pointer", outline: "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 4, background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CalendarDays size={14} />
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{month} {selectedYear}</div>
                        <div style={{ fontSize: 10, color: "#aaa" }}>{monthRegisters.length} cajas</div>
                      </div>
                    </div>
                    <div style={{ color: "#888" }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div>
                      <CashRegisterTable cashRegisters={monthRegisters} isLoading={false} onViewDetails={handleViewDetails} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {availableYears.length > 0 && selectedYear !== null && (
            <div style={{ marginTop: 16 }}>
              <TablePagination
                currentPage={availableYears.indexOf(selectedYear) + 1}
                totalPages={availableYears.length}
                onPageChange={(page) => setSelectedYear(availableYears[page - 1])}
                summary={
                  <span style={{ fontSize: 11, color: "#888" }}>
                    Mostrando <strong style={{ color: "#111" }}>{cashRegistersByYear.length}</strong> cajas del año <strong style={{ color: "#111" }}>{selectedYear}</strong>
                  </span>
                }
              />
            </div>
          )}
        </>
      )}

      {/* Modal View Detail */}
      {viewCashRegister && createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(17,17,17,0.4)", backdropFilter: "blur(2px)", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 1000, maxHeight: "95vh", background: "#fff", borderRadius: 6, display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #e8e8e8" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", background: "#fafafa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>Detalle de Caja</div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>Caja {viewCashRegister.status} · {new Date(viewCashRegister.openedAt).toLocaleString('es-AR')}</div>
              </div>
              <button onClick={() => setViewCashRegister(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#aaa" }}><X size={16} /></button>
            </div>
            
            <div style={{ overflowY: "auto", flex: 1, padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }} className="max-sm:grid-cols-1">
                <MetaCell label="Monto Inicial" value={fmt(viewCashRegister.initialCash)} />
                <MetaCell label="Total Ventas" value={fmt(viewCashRegister.totalSales || 0)} accent="#e8e8e8" />
                <MetaCell 
                  label="Diferencia de Cierre" 
                  value={viewCashRegister.difference !== undefined && viewCashRegister.difference !== null ? `${viewCashRegister.difference > 0 ? '+' : ''}${fmt(viewCashRegister.difference)}` : '-'} 
                  danger={viewCashRegister.difference! < 0}
                  warn={viewCashRegister.difference! === 0}
                  accent={viewCashRegister.difference! > 0 ? "#16a34a" : undefined}
                />
              </div>
              
              <div style={{ fontSize: 11, fontWeight: 600, color: "#111", letterSpacing: "-0.01em", marginBottom: 8 }}>Registro de Ventas</div>
              <div style={{ border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden" }}>
                <SalesTransactionTable sales={expandedSales || []} isLoading={loadingExpandedSales} />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Forms */}
      {showOpenForm && <OpenCashForm onClose={() => setShowOpenForm(false)} onSuccess={() => setShowOpenForm(false)} onSubmit={handleOpenCash} isLoading={openingCash} />}
      {showCloseForm && selectedCashRegister && (
        <CloseCashForm cashRegisterId={selectedCashRegister.id.toString()} initialCash={selectedCashRegister.initialCash} totalCash={selectedCashRegister.totalCash} totalTransfer={selectedCashRegister.totalTransfer} totalCuentaCorriente={selectedCashRegister.totalCuentaCorriente} totalSales={selectedCashRegister.totalSales || 0} totalCost={selectedCashRegister.totalCost || 0} totalProfit={selectedCashRegister.totalProfit || 0} totalWithdrawals={selectedCashRegister.totalWithdrawals || 0} totalDeposits={selectedCashRegister.totalDeposits || 0} totalDebtPayments={selectedCashRegister.totalDebtPayments || 0} onClose={() => { setShowCloseForm(false); setSelectedCashRegister(null); }} onSuccess={() => { setShowCloseForm(false); setSelectedCashRegister(null); }} onSubmit={handleCloseCash} isLoading={closingCash} />
      )}
      {showMovementModal && openCashRegister && <CashMovementModal cashRegisterId={openCashRegister.id} onClose={() => setShowMovementModal(false)} onSubmit={async () => {}} />}
    </div>
  );
};

export default CashRegisterPage;

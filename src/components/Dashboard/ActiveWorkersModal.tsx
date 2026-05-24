import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, DollarSign, UserCheck, ChevronDown, ChevronUp, LayoutDashboard } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { useCashMovements } from '../../hooks/useCashMovements';
import { useSalesByCashRegister } from '../../hooks/useSales';
import CashMovementsTable from '../CashRegister/CashMovementsTable';
import SalesTransactionTable from '../CashRegister/SalesTransactionTable';

interface ActiveWorkersModalProps {
  isOpen: boolean;
  onClose: () => void;
  openRegisters: any[];
}

const formatCurrency = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) return "$0";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

const ActiveWorkerItem = ({ register, users }: { register: any, users: any[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const userId = register.user?.id || register.user?._id || register.user;
  const userObj = users?.find((u: any) => u.id === userId || u._id === userId);
  const sellerName = userObj?.name || register.user?.name || register.user || 'Usuario desconocido';

  const { data: movements, isLoading: loadingMovements } = useCashMovements(register.id || register._id, isExpanded);
  const { data: sales, isLoading: loadingSales } = useSalesByCashRegister(register.id || register._id, isExpanded);

  const { replenishmentCost, grossProfit } = useMemo(() => {
    let repCost = 0;
    let profit = 0;
    if (sales) {
      sales.forEach((sale: any) => {
        if (sale.status === 'cancelado') return;
        let saleCost = 0;
        sale.details?.forEach((d: any) => {
          saleCost += (d.costPrice * d.quantity);
        });
        repCost += saleCost;
        if (sale.paymentMethod !== 'cuenta_corriente') {
          profit += (sale.total - saleCost);
        }
      });
    }
    return { replenishmentCost: repCost, grossProfit: profit };
  }, [sales]);

  return (
    <div className={`border border-neutral-200 rounded-lg overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-neutral-50/30 ring-1 ring-accent-500/20' : 'bg-white hover:bg-neutral-50'}`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-100 text-lg font-bold text-accent-700">
            {sellerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-base">{sellerName}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Apertura: {new Date(register.openedAt || register.createdAt).toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'})}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign size={12} />
                  Base: {formatCurrency(register.initialCash)}
                </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-neutral-900">Ventas: {formatCurrency(register.totalSales || 0)}</p>
            <p className="text-xs text-neutral-500 mt-0.5">Esperado: {formatCurrency(register.expectedCash || 0)}</p>
          </div>
          <button className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-accent-100 text-accent-700' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700'}`}>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-neutral-200 bg-white p-6 animate-in slide-in-from-top-4 duration-300">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
             <div className="bg-neutral-50 rounded p-4 border border-neutral-100">
               <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">Ventas Efectivo</p>
               <p className="text-lg font-bold text-neutral-900 mt-1">{formatCurrency(register.totalCash || 0)}</p>
             </div>
             <div className="bg-neutral-50 rounded p-4 border border-neutral-100">
               <p className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">Tarj / Transf</p>
               <p className="text-lg font-bold text-neutral-900 mt-1">{formatCurrency(register.totalTransfer || 0)}</p>
             </div>
             <div className="bg-green-50 rounded p-4 border border-green-100">
               <p className="text-[10px] text-green-700 font-semibold uppercase tracking-wider">Ingresos</p>
               <p className="text-lg font-bold text-green-700 mt-1">+{formatCurrency(register.totalDeposits || 0)}</p>
             </div>
             <div className="bg-red-50 rounded p-4 border border-red-100">
               <p className="text-[10px] text-red-700 font-semibold uppercase tracking-wider">Retiros</p>
               <p className="text-lg font-bold text-red-700 mt-1">-{formatCurrency(register.totalWithdrawals || 0)}</p>
             </div>
             <div className="bg-orange-50 rounded p-4 border border-orange-100">
               <p className="text-[10px] text-orange-700 font-semibold uppercase tracking-wider">Costo Reposición</p>
               {loadingSales ? (
                 <div className="h-7 w-16 bg-orange-200/50 animate-pulse rounded mt-1"></div>
               ) : (
                 <p className="text-lg font-bold text-orange-700 mt-1">{formatCurrency(replenishmentCost)}</p>
               )}
             </div>
             <div className="bg-blue-50 rounded p-4 border border-blue-100">
               <p className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider">Ganancia Bruta</p>
               {loadingSales ? (
                 <div className="h-7 w-16 bg-blue-200/50 animate-pulse rounded mt-1"></div>
               ) : (
                 <p className="text-lg font-bold text-blue-700 mt-1">{formatCurrency(grossProfit)}</p>
               )}
             </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
               <LayoutDashboard size={16} className="text-accent-600" />
               Registro de Ventas de la Sesión
            </h4>
            <div className="border border-neutral-200 rounded-md overflow-hidden bg-white shadow-sm">
               <SalesTransactionTable sales={sales || []} isLoading={loadingSales} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
               <DollarSign size={16} className="text-accent-600" />
               Movimientos de Efectivo (Ingresos/Retiros)
            </h4>
            <div className="border border-neutral-200 rounded-md overflow-hidden bg-white shadow-sm">
               <CashMovementsTable movements={movements || []} isLoading={loadingMovements} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export const ActiveWorkersModal: React.FC<ActiveWorkersModalProps> = ({ isOpen, onClose, openRegisters }) => {
  const { data: users } = useUsers();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-neutral-950/40 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl max-h-[95vh] flex flex-col rounded-md bg-white shadow-sm border border-neutral-200 scale-in-center overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-neutral-50/50 border-b border-neutral-200 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
               <UserCheck size={20} />
             </div>
             <div>
               <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">Personal Trabajando</h2>
               <p className="text-xs font-medium text-neutral-500 mt-1">Sesiones de caja activas</p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        
        {/* Body */}
        <div className="overflow-y-auto flex-1 custom-scrollbar relative z-10 bg-white p-6">
          {openRegisters.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {openRegisters.map((register) => (
                <ActiveWorkerItem key={register.id || register._id} register={register} users={users || []} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <UserCheck size={48} className="mb-4 text-neutral-300" strokeWidth={1} />
              <p className="text-lg font-medium text-neutral-600">No hay nadie trabajando</p>
              <p className="text-sm">Actualmente no existen cajas abiertas en el sistema.</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

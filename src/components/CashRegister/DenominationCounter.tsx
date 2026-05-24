import { useState, useEffect } from 'react';
import type { DenominationCount } from '../../services/types';

interface DenominationCounterProps {
  onChange: (total: number, denominations: DenominationCount) => void;
  initialDenominations?: DenominationCount;
}

interface DenominationConfig {
  label: string;
  value: number;
  type: 'billete' | 'moneda';
}

const DENOMINATIONS: DenominationConfig[] = [
  { label: '$20.000', value: 20000, type: 'billete' },
  { label: '$10.000', value: 10000, type: 'billete' },
  { label: '$5.000', value: 5000, type: 'billete' },
  { label: '$2.000', value: 2000, type: 'billete' },
  { label: '$1.000', value: 1000, type: 'billete' },
  { label: '$500', value: 500, type: 'billete' },
  { label: '$200', value: 200, type: 'billete' },
  { label: '$100', value: 100, type: 'billete' },
  { label: '$50', value: 50, type: 'moneda' },
  { label: '$25', value: 25, type: 'moneda' },
  { label: '$10', value: 10, type: 'moneda' },
  { label: '$5', value: 5, type: 'moneda' },
  { label: '$2', value: 2, type: 'moneda' },
  { label: '$1', value: 1, type: 'moneda' },
];

const DenominationCounter = ({ onChange, initialDenominations }: DenominationCounterProps) => {
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    DENOMINATIONS.forEach(d => {
      initial[d.value.toString()] = initialDenominations?.[d.value.toString()] || 0;
    });
    return initial;
  });

  useEffect(() => {
    const denominations: DenominationCount = {};
    let total = 0;

    DENOMINATIONS.forEach(d => {
      const count = counts[d.value.toString()] || 0;
      if (count > 0) {
        denominations[d.value.toString()] = count;
      }
      total += d.value * count;
    });

    onChange(total, denominations);
  }, [counts]);

  const handleCountChange = (denomination: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) return;
    setCounts(prev => ({ ...prev, [denomination]: numValue }));
  };

  const totalBilletes = DENOMINATIONS
    .filter(d => d.type === 'billete')
    .reduce((sum, d) => sum + d.value * (counts[d.value.toString()] || 0), 0);

  const totalMonedas = DENOMINATIONS
    .filter(d => d.type === 'moneda')
    .reduce((sum, d) => sum + d.value * (counts[d.value.toString()] || 0), 0);

  const grandTotal = totalBilletes + totalMonedas;

  return (
    <div className="space-y-4">
      {/* Billetes */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span className="w-5 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-sm inline-block"></span>
          Billetes
        </h4>
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Denominación</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 w-24">Cantidad</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {DENOMINATIONS.filter(d => d.type === 'billete').map(d => {
                const count = counts[d.value.toString()] || 0;
                const subtotal = d.value * count;
                return (
                  <tr key={d.value} className={count > 0 ? 'bg-green-50/50' : ''}>
                    <td className="px-3 py-2">
                      <span className="text-sm font-medium text-gray-800">{d.label}</span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={count || ''}
                        onChange={(e) => handleCountChange(d.value.toString(), e.target.value)}
                        placeholder="0"
                        className="w-full text-center border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-sm font-medium ${count > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                        ${subtotal.toLocaleString('es-AR')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-green-50 border-t-2 border-green-200">
                <td colSpan={2} className="px-3 py-2 text-sm font-semibold text-green-800">Subtotal Billetes</td>
                <td className="px-3 py-2 text-right text-sm font-bold text-green-800">${totalBilletes.toLocaleString('es-AR')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Monedas */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full inline-block"></span>
          Monedas
        </h4>
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Denominación</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 w-24">Cantidad</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {DENOMINATIONS.filter(d => d.type === 'moneda').map(d => {
                const count = counts[d.value.toString()] || 0;
                const subtotal = d.value * count;
                return (
                  <tr key={d.value} className={count > 0 ? 'bg-yellow-50/50' : ''}>
                    <td className="px-3 py-2">
                      <span className="text-sm font-medium text-gray-800">{d.label}</span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={count || ''}
                        onChange={(e) => handleCountChange(d.value.toString(), e.target.value)}
                        placeholder="0"
                        className="w-full text-center border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`text-sm font-medium ${count > 0 ? 'text-yellow-700' : 'text-gray-400'}`}>
                        ${subtotal.toLocaleString('es-AR')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-yellow-50 border-t-2 border-yellow-200">
                <td colSpan={2} className="px-3 py-2 text-sm font-semibold text-yellow-800">Subtotal Monedas</td>
                <td className="px-3 py-2 text-right text-sm font-bold text-yellow-800">${totalMonedas.toLocaleString('es-AR')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Grand Total */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium opacity-90">TOTAL CONTADO</span>
          <span className="text-2xl font-bold">${grandTotal.toLocaleString('es-AR')}</span>
        </div>
      </div>
    </div>
  );
};

export default DenominationCounter;

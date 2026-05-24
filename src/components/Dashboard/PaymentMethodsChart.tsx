interface PaymentMethodsChartProps {
  salesByPaymentMethod: {
    efectivo: number;
    transferencia: number;
    cuentaCorriente: number;
  };
  totalSales: number;
}

export const PaymentMethodsChart = ({
  salesByPaymentMethod,
  totalSales,
}: PaymentMethodsChartProps) => {
  const methods = [
    {
      key: "efectivo" as const,
      label: "Efectivo",
      color: "bg-accent-600 dark:bg-accent-500",
    },
    {
      key: "transferencia" as const,
      label: "Transferencia",
      color: "bg-accent-500 dark:bg-accent-400",
    },
    {
      key: "cuentaCorriente" as const,
      label: "Cuenta corriente",
      color: "bg-accent-400 dark:bg-accent-300",
    },
  ];

  return (
    <div className="app-card p-5 sm:p-6 h-full flex flex-col justify-between">
      <div>
        <h3 className="section-title mb-5 dark:text-neutral-100">Ventas por método de pago</h3>
        <div className="space-y-5">
          {methods.map(({ key, label, color }) => {
            const count = salesByPaymentMethod[key] || 0;
            const percentage = (count / (totalSales || 1)) * 100;

            return (
              <div key={key}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
                  <span className="font-medium tabular-nums text-neutral-900 dark:text-neutral-200">
                    {count}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={`h-full rounded-full ${color} transition-all duration-500`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

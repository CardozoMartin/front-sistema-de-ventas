import { type ComponentType, type ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  subtitle?: ReactNode;
  onClick?: () => void;
}

export const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  subtitle,
  onClick,
}: MetricCardProps) => {
  return (
    <div
      className={`app-card flex flex-col justify-between gap-4 p-5 transition-all duration-300 ${
        onClick
          ? "cursor-pointer hover:border-accent-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
          : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-350">
          <Icon size={18} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block truncate text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {title}
          </span>
          <p className="mt-1 break-words text-xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">
            {value}
          </p>
        </div>
      </div>
      {(trend || subtitle) && (
        <div className="flex flex-col gap-1 border-t border-neutral-100 dark:border-neutral-800 pt-3">
          {trend && trendValue && (
            <span
              className={`inline-flex items-start gap-1 text-xs font-medium ${
                trend === "up"
                  ? "text-accent-700 dark:text-accent-400"
                  : trend === "down"
                  ? "text-red-600 dark:text-red-400"
                  : "text-neutral-500"
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {trend === "up" ? (
                  <TrendingUp size={12} />
                ) : trend === "down" ? (
                  <TrendingDown size={12} />
                ) : null}
              </span>
              <span>{trendValue} vs período anterior</span>
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

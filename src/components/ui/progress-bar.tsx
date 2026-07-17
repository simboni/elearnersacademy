import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  barClassName,
  showLabel = false,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2 flex-1 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-700", className)}>
        <div
          className={cn("h-full rounded-full bg-gradient-to-r from-sky to-gold-400 transition-all duration-500", barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-navy-500 dark:text-slate-400">{Math.round(pct)}%</span>
      )}
    </div>
  );
}

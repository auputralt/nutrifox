"use client";

interface Props {
  label: string;
  value: number;
  unit: string;
  color: string;
  maxValue: number;
  delay?: number;
}

export default function MacroBar({
  label,
  value,
  unit,
  color,
  maxValue,
  delay = 0,
}: Props) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-sm font-medium text-txt-secondary shrink-0">
        {label}
      </div>
      <div className="flex-1 h-2.5 bg-bg-subtle rounded-full overflow-hidden">
        <div
          className="h-full rounded-full macro-bar-fill"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            animationDelay: `${delay}ms`,
          }}
        />
      </div>
      <div className="w-16 text-right text-sm font-medium text-txt tabular-nums">
        {Math.round(value)}
        <span className="text-txt-muted ml-0.5">{unit}</span>
      </div>
    </div>
  );
}

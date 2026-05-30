"use client";

interface Props {
  items: string[];
  variant: "danger" | "warning";
  icon: "alert" | "info";
}

export default function AlertBadge({ items, variant, icon }: Props) {
  if (items.length === 0) return null;

  const colors =
    variant === "danger"
      ? "bg-danger-soft text-danger border-danger/10"
      : "bg-warning-soft text-warning border-warning/10";

  return (
    <div className={`rounded-xl border px-4 py-3 ${colors}`}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0">
          {icon === "alert" ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </span>
        <div>
          <p className="text-sm font-medium mb-1">
            {variant === "danger"
              ? "Allergen Warning"
              : "Restriction Conflict"}
          </p>
          <p className="text-sm opacity-80">{items.join(", ")}</p>
        </div>
      </div>
    </div>
  );
}

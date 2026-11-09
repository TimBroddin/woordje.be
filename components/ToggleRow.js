"use client";

import { cn } from "@/lib/utils";

/** A labelled on/off switch as a full-width row (settings lists, forms). */
const ToggleRow = ({ checked, onChange, label, description, className }) => (
  <label className={cn("flex items-center gap-3 px-4 py-3 min-h-14 cursor-pointer", className)}>
    <span className="flex-1 min-w-0">
      <span className="block text-sm font-bold">{label}</span>
      {description && <span className="block text-xs text-[var(--muted-foreground)]">{description}</span>}
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full",
        "transition-colors duration-150",
        checked ? "bg-[var(--primary)]" : "bg-[var(--border-strong)]",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
          "transition-transform duration-150 ease-[var(--ease-out-quart)]",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  </label>
);

export default ToggleRow;

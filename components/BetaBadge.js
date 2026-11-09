import { cn } from "@/lib/utils";

/** Marks features that are still settling in (multiplayer). */
export default function BetaBadge({ className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--primary)]/40 px-1.5",
        "text-[10px] font-bold uppercase tracking-wider leading-4 text-[var(--primary)]",
        "align-middle shrink-0",
        className
      )}
    >
      Beta
    </span>
  );
}

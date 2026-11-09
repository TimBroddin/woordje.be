import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { forwardRef } from "react";

/** Page column. `wide` lets a page go two-column on desktop (≥1024px). */
export const Main = ({ children, className, wide }) => {
  return (
    <main
      className={cn(
        "text-[var(--foreground)] mx-auto min-h-screen",
        "h-[100dvh] w-full",
        wide ? "max-w-[480px] lg:max-w-[1040px]" : "max-w-[480px]",
        className
      )}
    >
      {children}
    </main>
  );
};

export const Board = forwardRef(
  ({ children, loading, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-300 ease-out relative",
          loading && "blur-[5px] scale-[0.98]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Board.displayName = "Board";

export const Row = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <m.div
      ref={ref}
      className={cn("flex justify-center items-center gap-1", className)}
      {...props}
    >
      {children}
    </m.div>
  );
});
Row.displayName = "Row";

export const Levels = ({ children, className, ...props }) => {
  return (
    <div className={cn("flex flex-wrap gap-1", className)} {...props}>
      {children}
    </div>
  );
};

export const Note = ({ children, className }) => {
  return (
    <div className={cn("px-4 text-sm text-[var(--muted-foreground)] [&>p]:m-0", className)}>
      {children}
    </div>
  );
};

/**
 * Word length / level button. Neutral by default; colour only says something:
 * selected (violet), won (green), lost (red outline).
 */
export const Level = forwardRef(
  ({ children, won, lost, active, wide, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center h-10 min-w-9 px-1.5",
          "rounded-lg border text-sm font-bold no-underline tabular-nums",
          "transition-colors duration-150",
          "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)]",
          "hover:border-[var(--border-strong)] hover:bg-[var(--muted)]",
          won && "bg-[var(--color-good)] border-transparent text-white hover:bg-[var(--color-good-dark)] hover:border-transparent",
          lost && "border-[var(--color-lost)] text-[var(--color-lost)]",
          active && "bg-[var(--primary)] border-transparent text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] hover:border-transparent",
          wide && "px-4",
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);
Level.displayName = "Level";

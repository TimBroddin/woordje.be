import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { forwardRef } from "react";

export const Main = ({ children, className }) => {
  return (
    <main
      className={cn(
        "text-[var(--foreground)] max-w-[480px] mx-auto min-h-screen",
        "h-[100dvh] w-full",
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

export const Levels = ({ children, className }) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {children}
    </div>
  );
};

export const Note = ({ children, type, className }) => {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 m-4",
        "shadow-[var(--shadow-soft)]",
        "bg-[var(--surface)]",
        type === "primary" &&
          "bg-gradient-to-br from-[var(--primary)] to-[#ff5252] [&>p]:text-[var(--primary-foreground)] [&>p]:m-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export const Level = forwardRef(
  ({ children, won, lost, active, wide, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          // Base styling - Soft, friendly level badge
          "font-bold text-sm text-white no-underline",
          "inline-flex items-center justify-center",
          "h-10 w-10 p-0",
          "border-none rounded-xl",
          "shadow-[var(--shadow-soft-sm)]",
          "transition-all duration-200 ease-out",
          // Default state - soft purple gradient
          "bg-gradient-to-br from-[var(--color-level)] to-[var(--accent)]",
          // Hover state - lift up
          "hover:shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:scale-105",
          // Active state (pressed)
          "active:shadow-[var(--shadow-soft-sm)] active:translate-y-0 active:scale-95",
          // Won state - happy green
          won && "bg-gradient-to-br from-[var(--color-good)] to-[var(--color-good-dark)]",
          // Lost state - soft rose
          lost && "bg-gradient-to-br from-[#f9a8d4] to-[#f472b6]",
          // Active/selected state - playful purple
          active && "bg-gradient-to-br from-[var(--color-level-active)] to-[#7c3aed] shadow-[var(--shadow-soft),_0_0_16px_rgba(139,92,246,0.5)] scale-110",
          // Wide variant
          wide && "w-auto px-4",
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

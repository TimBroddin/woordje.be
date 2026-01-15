import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles - Soft & Friendly
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-semibold",
    "border-none rounded-xl",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-[var(--primary-foreground)]",
          "shadow-[var(--shadow-soft-sm)]",
          "hover:shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:scale-[1.02]",
          "active:shadow-[var(--shadow-soft-sm)] active:translate-y-0 active:scale-[0.98]",
        ],
        destructive: [
          "bg-gradient-to-br from-red-500 to-red-600 text-white",
          "shadow-[var(--shadow-soft-sm)]",
          "hover:shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:scale-[1.02]",
          "active:shadow-[var(--shadow-soft-sm)] active:translate-y-0 active:scale-[0.98]",
        ],
        outline: [
          "bg-[var(--surface)] text-[var(--foreground)]",
          "shadow-[var(--shadow-soft-sm)]",
          "hover:bg-[var(--muted)]",
          "hover:shadow-[var(--shadow-soft)] hover:-translate-y-1",
          "active:shadow-[var(--shadow-soft-sm)] active:translate-y-0",
        ],
        secondary: [
          "bg-[var(--muted)] text-[var(--foreground)]",
          "shadow-[var(--shadow-soft-sm)]",
          "hover:shadow-[var(--shadow-soft)] hover:-translate-y-1",
          "active:shadow-[var(--shadow-soft-sm)] active:translate-y-0",
        ],
        ghost: [
          "shadow-none rounded-lg",
          "hover:bg-[var(--muted)]",
        ],
        link: [
          "shadow-none",
          "text-[var(--primary)] underline-offset-4 hover:underline",
        ],
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-13 px-8 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }

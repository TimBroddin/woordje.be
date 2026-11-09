import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-bold",
    "border border-transparent rounded-xl",
    "transition-[background-color,border-color,color,transform] duration-150 ease-[var(--ease-out-quart)]",
    "active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline:
          "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border-strong)] hover:bg-[var(--muted)]",
        secondary:
          "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]",
        ghost:
          "text-[var(--foreground)] hover:bg-[var(--muted)]",
        link: "text-[var(--primary)] underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
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

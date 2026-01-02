import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-white text-background shadow hover:bg-white/90",
        primary:
          "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border border-primary bg-transparent text-primary shadow-sm hover:bg-primary/10",
        "outline-blue":
          "border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:bg-blue-500/15",
        ghost:
          "bg-transparent text-gray-300 hover:bg-white-subtle hover:text-white",
        "ghost-destructive":
          "bg-transparent text-red-600 hover:bg-red-600/10",
        link: "text-primary underline-offset-4 hover:underline",
        // FAB (Floating Action Button)
        fab:
          "bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg transition-transform hover:scale-105",
        "fab-blue":
          "bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20 transition-transform hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-9 w-9",
        "icon-xs": "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

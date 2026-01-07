import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button Component Architecture
 */

const buttonVariants = cva(
  // Base styles: Focus rings, Flex layout, Transitions
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      // 1. Visual Style (Fill/Border)
      variant: {
        solid: "shadow text-white",
        outline: "border bg-transparent shadow-sm",
        ghost: "bg-transparent",
        link: "bg-transparent underline-offset-4 hover:underline",
        default: "bg-white text-background shadow hover:bg-white/90",
      },

      // 2. Color Palette (Intent)
      palette: {
        primary: "",
        destructive: "",
        blue: "",
        gray: "",
        white: "",
      },

      // 3. Shape
      shape: {
        default: "rounded-xl",
        pill: "rounded-full",
        square: "rounded-md",
      },

      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-9 w-9 p-0",
        "icon-xs": "h-6 w-6 p-0",
        fab: "h-12 px-6 shadow-lg hover:scale-105 transition-transform",
        "fab-icon": "h-12 w-12 p-0 shadow-lg hover:scale-105 transition-transform",
      },
    },

    // 4. Compound Variants
    compoundVariants: [
      // --- SOLID VARIANTS ---
      { variant: "solid", palette: "primary", class: "bg-primary hover:bg-primary-hover shadow-primary/20 focus-visible:ring-primary/50" },
      { variant: "solid", palette: "destructive", class: "bg-red-600 hover:bg-red-700 shadow-red-600/20 focus-visible:ring-red-600/50" },
      { variant: "solid", palette: "blue", class: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 focus-visible:ring-blue-500/50" },
      { variant: "solid", palette: "gray", class: "bg-gray-600 hover:bg-gray-500" },

      // --- OUTLINE VARIANTS ---
      { variant: "outline", palette: "primary", class: "border-primary text-primary hover:bg-primary/10" },
      { variant: "outline", palette: "blue", class: "border-blue-500/20 bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:bg-blue-500/15" },
      { variant: "outline", palette: "gray", class: "border-white-subtle text-gray-300 hover:bg-white-subtle hover:text-white" },

      // --- GHOST VARIANTS ---
      { variant: "ghost", palette: "primary", class: "text-primary hover:bg-primary/10" },
      { variant: "ghost", palette: "destructive", class: "text-red-600 hover:bg-red-600/10" },
      { variant: "ghost", palette: "gray", class: "text-gray-300 hover:bg-white-subtle hover:text-white" },
      { variant: "ghost", palette: "blue", class: "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10" },

      // --- LINK VARIANTS ---
      { variant: "link", palette: "primary", class: "text-primary" },
      { variant: "link", palette: "blue", class: "text-blue-400" },
    ],

    defaultVariants: {
      variant: "solid",
      palette: "primary",
      size: "default",
      shape: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, palette, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, palette, size, shape, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

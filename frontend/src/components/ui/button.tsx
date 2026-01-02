import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button Component Architecture
 *
 * Separates visual style (variant) from color context (palette).
 * "Fab" is treated as a shape/usage pattern, not just a color variant.
 */

const buttonVariants = cva(
  // Base styles: Focus rings, Flex layout, Transitions
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      // 1. Visual Style (Fill/Border)
      variant: {
        solid: "shadow text-white", // Background color defined by palette
        outline: "border bg-transparent shadow-sm", // Border color defined by palette
        ghost: "bg-transparent", // Text color defined by palette, bg on hover
        link: "bg-transparent underline-offset-4 hover:underline",

        // Legacy/Specific overrides kept for backward compatibility if needed,
        // but ideally mapped to new system
        default: "bg-white text-background shadow hover:bg-white/90",
      },

      // 2. Color Palette (Intent)
      palette: {
        primary: "", // Default primary
        destructive: "", // Red/Danger
        blue: "", // Info/Action
        gray: "", // Neutral
        white: "", // Inverted
      },

      // 3. Shape (Optional, for FABs)
      shape: {
        default: "rounded-xl",
        pill: "rounded-full", // For FABs and Pills
        square: "rounded-md", // For icon buttons sometimes
      },

      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-9 w-9 p-0",
        "icon-xs": "h-6 w-6 p-0",
        // FAB sizes usually differ slightly
        fab: "h-12 px-6 shadow-lg hover:scale-105 transition-transform",
        "fab-icon": "h-12 w-12 p-0 shadow-lg hover:scale-105 transition-transform",
      },
    },

    // 4. Compound Variants: Merging Style + Color
    compoundVariants: [
      // --- SOLID VARIANTS ---
      { variant: "solid", palette: "primary", class: "bg-primary hover:bg-primary-hover shadow-primary/20" },
      { variant: "solid", palette: "destructive", class: "bg-red-600 hover:bg-red-700 shadow-red-600/20" },
      { variant: "solid", palette: "blue", class: "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20" },
      { variant: "solid", palette: "gray", class: "bg-gray-600 hover:bg-gray-500" },

      // --- OUTLINE VARIANTS ---
      { variant: "outline", palette: "primary", class: "border-primary text-primary hover:bg-primary/10" },
      { variant: "outline", palette: "blue", class: "border-blue-500/20 bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:bg-blue-500/15" }, // Your "outline-blue"
      { variant: "outline", palette: "gray", class: "border-white-subtle text-gray-300 hover:bg-white-subtle hover:text-white" },

      // --- GHOST VARIANTS ---
      { variant: "ghost", palette: "primary", class: "text-primary hover:bg-primary/10" },
      { variant: "ghost", palette: "destructive", class: "text-red-600 hover:bg-red-600/10" }, // Your "ghost-destructive"
      { variant: "ghost", palette: "gray", class: "text-gray-300 hover:bg-white-subtle hover:text-white" }, // Your default "ghost"
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

    // Auto-map legacy variants if passed directly (optional helper logic)
    // or rely on strict new usage.

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

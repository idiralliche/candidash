import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge Component Architecture
 *
 * Uses a dual-variant system to separate structural style from color:
 * 1. variant: Controls the shape/fill (solid, subtle, outline)
 * 2. palette: Controls the color scheme (red, blue, green, etc.)
 *
 * Compound variants are used to merge these two dimensions efficiently.
 */

const badgeVariants = cva(
  // 1. Base Styles (Geometry, Fonts, Focus states)
  "inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-nowrap",
  {
    variants: {
      // 2. Structural Variants (The "Look")
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        solid: "border-transparent shadow text-white hover:opacity-90",
        subtle: "border-transparent bg-opacity-10 hover:bg-opacity-20", // Base for tinted backgrounds
        ghost: "border-none bg-transparent",
        outline: "text-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
      },
      // 3. Color Palettes (The "Tint")
      palette: {
        default: "", // Inherits from variant defaults
        gray: "border-gray-500/20",
        red: "border-red-500/20",
        blue: "border-blue-500/20",
        emerald: "border-emerald-500/20",
        green: "border-green-500/20",
        orange: "border-orange-500/20",
        purple: "border-purple-500/20",
        yellow: "border-yellow-500/20",
        sky: "border-sky-500/20",
        indigo: "border-indigo-500/20",
      },
    },
    // 4. Compound Variants (Merging Look + Tint)
    // This is where we define the specific "Subtle" look for each color
    // preventing the "border-transparent" repetition in usage.
    compoundVariants: [
      // Gray
      { variant: "subtle", palette: "gray", class: "bg-gray-500/10 text-gray-400" },
      { variant: "solid", palette: "gray", class: "bg-gray-500 text-white" },

      // Red
      { variant: "subtle", palette: "red", class: "bg-red-500/10 text-red-400" },
      { variant: "solid", palette: "red", class: "bg-red-500 text-white" },

      // Blue
      { variant: "subtle", palette: "blue", class: "bg-blue-500/10 text-blue-400" },
      { variant: "solid", palette: "blue", class: "bg-blue-500 text-white" },
      { variant: "ghost", palette: "blue", class: "text-blue-500" },

      // Emerald
      { variant: "subtle", palette: "emerald", class: "bg-emerald-500/10 text-emerald-400" },
      { variant: "solid", palette: "emerald", class: "bg-emerald-500 text-white" },

      // Green
      { variant: "subtle", palette: "green", class: "bg-green-500/10 text-green-400" },
      { variant: "solid", palette: "green", class: "bg-green-600 text-white" },

      // Orange
      { variant: "subtle", palette: "orange", class: "bg-orange-500/10 text-orange-400" },
      { variant: "solid", palette: "orange", class: "bg-orange-500 text-white" },

      // Purple
      { variant: "subtle", palette: "purple", class: "bg-purple-500/10 text-purple-400" },
      { variant: "solid", palette: "purple", class: "bg-purple-600 text-white" },

       // Yellow
      { variant: "subtle", palette: "yellow", class: "bg-yellow-500/10 text-yellow-400" },
      { variant: "solid", palette: "yellow", class: "bg-yellow-500 text-white" },

      // Sky
      { variant: "subtle", palette: "sky", class: "bg-sky-500/10 text-sky-400" },

      // Indigo
      { variant: "subtle", palette: "indigo", class: "bg-indigo-500/10 text-indigo-400" },
    ],
    defaultVariants: {
      variant: "default",
      palette: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, palette, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, palette }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

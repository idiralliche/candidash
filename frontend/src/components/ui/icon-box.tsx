import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconBoxVariants = cva(
  "flex shrink-0 items-center justify-center border transition-colors font-bold",
  {
    variants: {
      palette: {
        default: "bg-primary/10 text-primary border-primary/20",
        gray: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        red: "bg-red-500/10 text-red-500 border-red-500/20",
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        green: "bg-green-500/10 text-green-500 border-green-500/20",
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        sky: "bg-sky-500/10 text-sky-500 border-sky-500/20",
        indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      },
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        md: "h-10 w-10 text-base",
        lg: "h-12 w-12 text-lg",
        xl: "h-16 w-16 text-2xl",
      },
      shape: {
        square: "rounded-lg",
        circle: "rounded-full",
      },
      border: {
        default: "border",
        thick: "border-2",
        none: "border-0",
      }
    },
    defaultVariants: {
      palette: "default",
      size: "md",
      shape: "square",
      border: "default",
    },
  }
)

export interface IconBoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconBoxVariants> {
    groupHover?: boolean;
}

export function IconBox({
  className,
  palette,
  size,
  shape,
  border,
  groupHover,
  ...props
}: IconBoxProps) {
  return (
    <div
      className={cn(
        iconBoxVariants({ palette, size, shape, border }),
        groupHover && "group-hover:bg-opacity-20",
        className
      )}
      {...props}
    />
  )
}

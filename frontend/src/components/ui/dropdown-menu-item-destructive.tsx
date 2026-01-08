import * as React from "react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export const DestructiveMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem>
>(({ className, ...props }, ref) => (
  <DropdownMenuItem
    ref={ref}
    className={cn(
      "text-red-600 focus:bg-red-600/10 focus:text-red-600 cursor-pointer",
      className
    )}
    {...props}
  />
))
DestructiveMenuItem.displayName = "DestructiveMenuItem"

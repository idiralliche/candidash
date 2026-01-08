import * as React from "react"
import { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { inputContainerVariants } from "./input"

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    Omit<VariantProps<typeof inputContainerVariants>, "disabled"> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, disabled, ...props }, ref) => {
    return (
      <div
        className={cn(
          inputContainerVariants({ variant, size, disabled: Boolean(disabled) }),
          "items-start py-2",
          className
        )}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName !== "TEXTAREA") {
             target.querySelector("textarea")?.focus();
          }
        }}
      >
        <textarea
          className={cn(
            "flex min-h-[80px] w-full bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed resize-none focus-visible:outline-none focus-visible:ring-0",
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

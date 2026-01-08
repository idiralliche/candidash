import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaContainerVariants = cva(
  "flex flex-col w-full rounded-md border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-background border-border text-foreground focus-within:border-primary/50",
        subtle: "bg-muted/50 border-border text-foreground focus-within:border-primary/50",
        form: "bg-surface-base border-white-light text-white focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20",
        "form-blue": "bg-surface-base border-white-light text-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20",
        ghost: "border-transparent bg-transparent",
        destructive: "border-destructive bg-surface-base text-white focus-within:ring-destructive/20",
      },
      size: {
        sm: "px-2 py-1.5",
        md: "px-3 py-2",
        lg: "px-4 py-3",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed bg-muted",
        false: "cursor-text"
      }
    },
    defaultVariants: {
      variant: "form",
      size: "md",
      disabled: false,
    },
  }
)

export interface TextareaProps
  extends Omit<React.ComponentProps<"textarea">, "size">,
    Omit<VariantProps<typeof textareaContainerVariants>, "disabled"> {
  showCharCount?: boolean
  resize?: "none" | "vertical" | "horizontal" | "both"
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    size,
    disabled,
    showCharCount = false,
    resize = "vertical",
    maxLength,
    value,
    ...props
  }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0
    const remainingChars = maxLength ? maxLength - currentLength : undefined

    return (
      <div className="w-full">
        <div
          className={cn(
            textareaContainerVariants({ variant, size, disabled: Boolean(disabled) }),
            className
          )}
          onClick={(e) => {
            const target = e.target as HTMLElement
            if (target.tagName !== "TEXTAREA") {
              target.querySelector("textarea")?.focus()
            }
          }}
        >
          <textarea
            className={cn(
              "flex min-h-[120px] w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-0",
              "overflow-y-auto scrollbar-thin scrollbar-thumb-white-light scrollbar-track-transparent",
              resize === "none" && "resize-none",
              resize === "vertical" && "resize-y",
              resize === "horizontal" && "resize-x",
              resize === "both" && "resize",
            )}
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            {...props}
          />
        </div>

        {/* Chars Count */}
        {showCharCount && maxLength && (
          <div className="mt-1 flex justify-end">
            <span
              className={cn(
                "text-xs tabular-nums transition-colors font-medium",
                "text-muted-foreground",
                remainingChars !== undefined && remainingChars < 50 && remainingChars >= 10 && "text-yellow-500",
                remainingChars !== undefined && remainingChars < 10 && remainingChars > 0 && "text-orange-500",
                remainingChars === 0 && "text-destructive font-bold"
              )}
            >
              {remainingChars} caractère{remainingChars !== 1 ? 's' : ''} restant{remainingChars !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea, textareaContainerVariants }

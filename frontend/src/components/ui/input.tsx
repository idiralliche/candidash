import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputContainerVariants = cva(
  "flex items-center w-full rounded-md border transition-colors cursor-text",
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
        sm: "h-8 px-2",
        md: "h-9 px-3",
        lg: "h-11 px-4",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed bg-muted",
        false: ""
      }
    },
    defaultVariants: {
      variant: "form",
      size: "md",
      disabled: false,
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    Omit<VariantProps<typeof inputContainerVariants>, "disabled"> {
  leadingIcon?: React.ElementType
  trailingIcon?: React.ElementType
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, disabled, leadingIcon: LeadingIcon, trailingIcon: TrailingIcon, ...props }, ref) => {

    return (
      <div
        className={cn(
          inputContainerVariants({ variant, size, disabled: Boolean(disabled) }),
          className
        )}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName !== "INPUT") {
             target.querySelector("input")?.focus();
          }
        }}
      >
        {LeadingIcon && (
          <div className="pr-2">
            <LeadingIcon className="h-4 w-4 text-muted-foreground shrink-0 select-none" />
          </div>
        )}

        <input
          type={type}
          className={cn(
            "flex h-full w-full bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-0",
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />

        {TrailingIcon && (
          <div className="pl-2">
            <TrailingIcon className="h-4 w-4 text-muted-foreground shrink-0 select-none" />
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputContainerVariants };

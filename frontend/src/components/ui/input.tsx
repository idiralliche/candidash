import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";


const inputVariants = cva(
  // Base classes (common to all variants)
  "flex h-9 w-full rounded-md border text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default:
          "bg-background border-border text-foreground focus:border-primary/50",
        subtle:
          "bg-muted/50 border-border text-foreground focus:border-primary/50",
        form: "bg-surface-base border-white-light text-white focus:border-primary/50",
        ghost: "border-transparent bg-transparent focus:border-border",
      },
      inputSize: {
        sm: "h-8 px-2 py-1 text-xs",
        md: "h-9 px-3 py-1", // default
        lg: "h-11 px-4 py-2 text-base",
      },
      hasIcon: {
        true: "pl-9",
        false: "",
      },
    },
    defaultVariants: {
      variant: "form",
      inputSize: "md",
      hasIcon: false,
    },
  }
);


export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  leadingIcon?: LucideIcon;
}


const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, hasIcon, leadingIcon, ...props }, ref) => {
    const Icon = leadingIcon;
    const hasLeadingIcon = !!leadingIcon;

    if (hasLeadingIcon) {
      return (
        <div className="relative">
          {Icon && <Icon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />}
          <input
            type={type}
            className={cn(inputVariants({ variant, inputSize, hasIcon: true, className }))}
            ref={ref}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, hasIcon, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);


Input.displayName = "Input";


export { Input, inputVariants };

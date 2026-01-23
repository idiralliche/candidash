import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { FieldCharCountInfo } from '@/components/ui/field-char-count'
import { useDebounce } from '@/hooks/shared/use-debounce'

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
  showCharCount?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  type,
  variant,
  size,
  disabled,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  maxLength,
  value = "",
  showCharCount = false,
  onChange,
  ...props
}, ref) => {

  const [internalValue, setInternalValue] = React.useState<string>(String(value));
  const debouncedValue = useDebounce(internalValue, 150);

  React.useEffect(() => {
    setInternalValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    let finalValue = newValue;

    if (maxLength && newValue.length > maxLength) {
      finalValue = newValue.slice(0, maxLength);

      setTimeout(() => {
        const cursorPos = e.target.selectionStart;
        if (cursorPos && cursorPos > maxLength) {
          e.target.setSelectionRange(maxLength, maxLength);
        }
      }, 0);
    }

    if (onChange) {
      const newEvent = {
        ...e,
        target: { ...e.target, value: finalValue },
        currentTarget: { ...e.currentTarget, value: finalValue }
      };
      onChange(newEvent);
    }
  };

  const currentLength = debouncedValue.length;
  const remainingChars = maxLength ? (maxLength - currentLength) : 0;
  const requiresDisable = !!disabled;

  return (
    <>
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
          disabled={requiresDisable}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />

        {TrailingIcon && (
          <div className="pl-2">
            <TrailingIcon className="h-4 w-4 text-muted-foreground shrink-0 select-none" />
          </div>
        )}
      </div>

      <FieldCharCountInfo
        showCharCount={showCharCount}
        maxLength={maxLength}
        remainingChars={maxLength ? remainingChars : undefined}
        type={type}
      />
    </>
  );
});

Input.displayName = "Input";

export { Input, inputContainerVariants };

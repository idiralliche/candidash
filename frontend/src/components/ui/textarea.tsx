import {
  useState,
  useEffect,
  forwardRef,
  ComponentProps,
  ChangeEvent,
} from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { FieldCharCountInfo } from '@/components/ui/field-char-count'
import { useDebounce } from '@/hooks/shared/use-debounce'

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
  extends Omit<ComponentProps<"textarea">, "size">,
    Omit<VariantProps<typeof textareaContainerVariants>, "disabled"> {
  showCharCount?: boolean
  resize?: "none" | "vertical" | "horizontal" | "both"
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    variant,
    size,
    disabled,
    showCharCount = false,
    resize = "vertical",
    maxLength,
    value = "",
    onChange,
    ...props
  }, ref) => {

    const [internalValue, setInternalValue] = useState<string>(String(value));
    const debouncedValue = useDebounce(internalValue, 150);

    useEffect(() => {
      setInternalValue(String(value));
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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
              resize === "both" && "resize"
            )}
            ref={ref}
            disabled={requiresDisable}
            maxLength={maxLength}
            value={value}
            onChange={handleChange}
            {...props}
          />
        </div>

        <FieldCharCountInfo
          showCharCount={showCharCount}
          maxLength={maxLength}
          remainingChars={maxLength ? remainingChars : undefined}
        />
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea, textareaContainerVariants }

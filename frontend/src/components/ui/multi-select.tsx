import { ChevronDown, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { inputContainerVariants } from "@/components/ui/input";
import { FieldValues, Path, ControllerRenderProps } from "react-hook-form";
import { useSmartField } from "@/hooks/shared/use-smart-field";

export interface MultiSelectOption {
  label: string;
  value: string;
  description?: string;
}

interface MultiSelectProps<T extends FieldValues, TName extends Path<T>> {
  field?: ControllerRenderProps<T, TName>;
  options: MultiSelectOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function MultiSelect<T extends FieldValues = FieldValues, TName extends Path<T> = Path<T>>({
  field: propField,
  options,
  value: propValue,
  onChange: propOnChange,
  placeholder = "Sélectionner...",
  disabled = false,
  isLoading = false,
  className,
}: MultiSelectProps<T, TName>) {

  const contextField = useSmartField<T, TName>();
  const field = propField || contextField;
  const currentValue: string[] = field?.value ?? propValue ?? [];

  const handleSelect = (optionValue: string) => {
    let newValue: string[];

    if (currentValue.includes(optionValue)) {
      newValue = currentValue.filter((v) => v !== optionValue);
    } else {
      newValue = [...currentValue, optionValue];
    }

    if (field) {
      field.onChange(newValue);
      field.onBlur();
    }

    if (propOnChange) {
      propOnChange(newValue);
    }
  };

  const selectedLabels = options
    .filter((opt) => currentValue.includes(opt.value))
    .map((opt) => opt.label);

  let triggerLabel = <span className="text-muted-foreground">{placeholder}</span>;

  if (currentValue.length > 0) {
    if (currentValue.length <= 2) {
      triggerLabel = (
        <span className="truncate block w-full" title={selectedLabels.join(", ")}>
          {selectedLabels.join(", ")}
        </span>
      );
    } else {
        triggerLabel = (
          <Badge
            variant="subtle"
            palette="blue"
          >
              {currentValue.length} sélectionnés
          </Badge>
        );
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled || isLoading}>
        <button
          type="button"
          className={cn(
            inputContainerVariants({ variant: "form", size: "md" }),
            "justify-between w-full text-left font-normal cursor-pointer",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden mr-2 flex-1">
            {isLoading ? (
                <span className="text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Chargement...
                </span>
            ) : (
                triggerLabel
            )}
          </div>

          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto"
        align="start"
      >
        {options.length === 0 ? (
          <div className="p-2 text-sm text-muted-foreground text-center">
            Aucun résultat
          </div>
        ) : (
          options.map((option) => {
            const isSelected = currentValue.includes(option.value);
            return (
              <DropdownMenuItem
                key={option.value}
                onSelect={(e) => {
                    e.preventDefault();
                    handleSelect(option.value);
                }}
                className={cn(
                  "cursor-pointer flex items-center justify-between gap-2 px-2 py-1.5 focus:bg-accent focus:text-accent-foreground",
                  isSelected ? "text-blue-500 font-medium" : "text-foreground"
                )}
              >
                <span className="truncate flex-1" title={option.label}>
                  {option.label}
                </span>

                {isSelected && (
                   <Check className="h-4 w-4 text-blue-500 shrink-0" />
                )}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

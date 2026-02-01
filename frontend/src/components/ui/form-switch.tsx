import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { FieldValues, Path, ControllerRenderProps } from "react-hook-form";
import { useSmartField } from "@/hooks/shared/use-smart-field";

interface FormSwitchProps<T extends FieldValues, TName extends Path<T>> {
  field?: ControllerRenderProps<T, TName>;
  label: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function FormSwitch<T extends FieldValues = FieldValues, TName extends Path<T> = Path<T>>({
  field: propField,
  label,
  description,
  checked,
  onCheckedChange,
  className,
  disabled
}: FormSwitchProps<T, TName>) {
  const contextField = useSmartField<T, TName>();
  const field = propField || contextField;

  const isChecked = field?.value ?? checked ?? false;

  const handleChange = (val: boolean) => {
    if (field) {
      field.onChange(val);
    }
    onCheckedChange?.(val);
  };

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between rounded-lg border border-white-light bg-surface-base p-3 transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="space-y-0.5 flex-1 pr-2">
        <label
          className={cn(
            "text-base font-medium text-white cursor-pointer select-none",
            disabled && "cursor-not-allowed"
          )}
          onClick={(e) => {
            e.preventDefault();
            if (!disabled) handleChange(!isChecked);
          }}
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-400">
            {description}
          </p>
        )}
      </div>
      <Switch
        checked={isChecked}
        onCheckedChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}

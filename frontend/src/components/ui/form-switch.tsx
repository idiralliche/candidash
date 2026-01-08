import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface FormSwitchProps {
  label: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  value?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function FormSwitch({
  label,
  description,
  checked,
  onCheckedChange,
  value,
  onChange,
  className
}: FormSwitchProps) {
  const isChecked = checked !== undefined ? checked : value;
  const handleChange = onCheckedChange || onChange;

  return (
    <div className={cn("flex flex-row items-center justify-between rounded-lg border border-white-light bg-surface-base p-3", className)}>
      <div className="space-y-0.5">
        <label className="text-base font-medium text-white cursor-pointer" onClick={() => handleChange?.(!isChecked)}>
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
      />
    </div>
  );
}

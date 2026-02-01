import {
  ReactNode,
  RefObject,
  ComponentPropsWithoutRef
} from 'react';
import { VariantProps } from "class-variance-authority"
import { LucideIcon } from 'lucide-react';
import * as SelectPrimitive from "@radix-ui/react-select"
import {
  FieldValues,
  Path,
  ControllerRenderProps,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wrap } from '@/components/ui/conditionnal-wrapper';
import { useSmartField } from "@/hooks/shared/use-smart-field";
import { inputContainerVariants } from "@/components/ui/input"

interface ItemParams {
  key?: number | string | undefined;
  value:string;
  label?:string;
}

interface SmartSelectProps<T extends FieldValues, TName extends Path<T>>
  extends ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    Omit<VariantProps<typeof inputContainerVariants>, "disabled"> {
  field?: ControllerRenderProps<T, TName>
  disabled?: boolean;
  ref?: RefObject<HTMLButtonElement | null>;
  autoFocus?: boolean;
  isFullW?: boolean;
  isOptional?: boolean;
  icon?: LucideIcon;
  placeholder?: string | {topic: string, suffix?: string} | undefined;
  items?: ItemParams[];
}

export function SmartSelect<T extends FieldValues, TName extends Path<T>> ({
  field: propField,
  disabled = false,
  ref,
  autoFocus=true,
  isFullW = false,
  isOptional = false,
  variant,
  icon: Icon,
  placeholder: placeholderProp,
  items,
} : SmartSelectProps<T, TName>) {
  const contextField = useSmartField<T, TName>();
  const field = propField || contextField;
  if (!field) {
    throw new Error("SmartSelect must be used within a SmartFormField or receive a 'field' prop.");
  }

  const hasIcon = !!Icon;
  const getPlaceholder = (): string => {
    if (!placeholderProp) return "Choisissez une option";
    if (typeof placeholderProp === 'string') return placeholderProp;
    return `Sélectionner un${placeholderProp.suffix || ""} ${placeholderProp.topic}`;
  };

  const onClear = isOptional && field.value ? () => field.onChange("") : undefined;

  const wrapper= (content: ReactNode) : ReactNode => (
    <div className="flex items-center gap-2 truncate">
      {content}
    </div>
  );

  return (
    <Select
      onValueChange={field.onChange}
      value={field.value}
      disabled={disabled}
    >
      <SelectTrigger
        className={isFullW ? "w-full" : ""}
        onClear={onClear}
        ref={ref}
        autoFocus={autoFocus}
        variant={variant || undefined}
      >
        <Wrap
          condition={hasIcon}
          with={wrapper}
          prepend={hasIcon? (<Icon className="h-4 w-4 text-muted-foreground shrink-0" />) : undefined}
        >
          <SelectValue placeholder={getPlaceholder()}/>
        </Wrap>
      </SelectTrigger>
      <SelectContent>
        {items?.map(({key, value, label}, i) => (
          <SelectItem key={key || value || i} value={value}>
            {label || value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

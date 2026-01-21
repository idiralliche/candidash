import {
  Control,
  FieldValues,
  Path,
  ControllerRenderProps,
} from "react-hook-form";
import {
  ReactNode,
  ComponentType,
} from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface SmartFormFieldProps<T extends FieldValues, TName extends Path<T>> {
  control: Control<T>;
  name: TName;
  label?: string;
  description?: string;
  className?: string;
  containerClassName?: string;
  children?: (field: ControllerRenderProps<T, TName>) => ReactNode;
  component?: ComponentType<ControllerRenderProps<T, TName> & Record<string, unknown>>;
  [key: string]: unknown;
}

export function SmartFormField<T extends FieldValues, TName extends Path<T>>({
  control,
  name,
  label,
  description,
  className,
  containerClassName,
  children,
  component: Component,
  ...props
}: SmartFormFieldProps<T, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("w-full", containerClassName)}>
          {label && (
            <FormLabel className="text-white">{label}</FormLabel>
          )}
          <FormControl>
            {children ? (
              children(field)
            ) : Component ? (
              <Component {...field} {...props} className={className} />
            ) : null}
          </FormControl>
          {description && (
            <FormDescription className="text-xs text-gray-400">
              {description}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

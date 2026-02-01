import {
  Control,
  FieldValues,
  Path,
  ControllerRenderProps,
} from "react-hook-form";
import {
  ReactNode,
  ComponentType,
  isValidElement,
  cloneElement,
  ReactElement, // Important pour le casting dans cloneElement
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
import { SmartFieldProvider } from "@/context/smart-field-provider";

type ChildElementProps<T extends FieldValues, TName extends Path<T>> =
  ControllerRenderProps<T, TName> & {
    className?: string;
  } & Record<string, unknown>;

interface SmartFormFieldProps<T extends FieldValues, TName extends Path<T>> {
  control: Control<T>;
  name: TName;
  label?: string;
  description?: string;
  className?: string;
  containerClassName?: string;
  // CORRECTION ICI : On accepte ReactNode OU une Fonction
  children?: ReactNode | ((field: ControllerRenderProps<T, TName>) => ReactNode);
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
            <SmartFieldProvider field={field}>
              {children ? (
                typeof children === 'function' ? (
                  children(field)
                ) : isValidElement(children) ? (
                  cloneElement(
                    children as ReactElement<ChildElementProps<T, TName>>,
                    {
                      ...field,
                      ...props,
                      className: cn(
                        className,
                        (children as ReactElement<{ className?: string }>).props.className
                      ),
                    }
                  )
                ) : null
              ) : Component ? (
                // Cas 3 : Prop 'component' (Legacy / Simple)
                <Component {...field} {...props} className={className} />
              ) : null}
            </SmartFieldProvider>
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

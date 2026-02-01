import { ReactNode } from "react";
import { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import { SmartFieldContext } from "@/context/smart-field-context";

interface SmartFieldProviderProps<T extends FieldValues, TName extends Path<T>> {
  field: ControllerRenderProps<T, TName>;
  children: ReactNode;
}

export function SmartFieldProvider<T extends FieldValues, TName extends Path<T>>({
  field,
  children,
}: SmartFieldProviderProps<T, TName>) {
  const contextValue = field as unknown as ControllerRenderProps<FieldValues, string>;

  return (
    <SmartFieldContext.Provider value={contextValue}>
      {children}
    </SmartFieldContext.Provider>
  );
}

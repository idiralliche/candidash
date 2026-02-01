import { useContext } from "react";
import { FieldValues, Path, ControllerRenderProps } from "react-hook-form";
import { SmartFieldContext } from "@/context/smart-field-context";

export function useSmartField<T extends FieldValues, TName extends Path<T>>() {
  const field = useContext(SmartFieldContext);

  return field as ControllerRenderProps<T, TName> | null;
}

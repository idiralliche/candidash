import { createContext } from "react";
import { ControllerRenderProps, FieldValues } from "react-hook-form";

export const SmartFieldContext = createContext<ControllerRenderProps<FieldValues, string> | null>(null);

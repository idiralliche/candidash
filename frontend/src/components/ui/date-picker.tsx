import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronDown,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  FieldValues,
  Path,
  ControllerRenderProps,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  Button,
  buttonVariants
} from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { inputContainerVariants } from "@/components/ui/input";
import { VariantProps } from "class-variance-authority";
import { useSmartField } from "@/hooks/shared/use-smart-field";
import { useState } from "react";

interface DatePickerProps<T extends FieldValues, TName extends Path<T>>
  extends Omit<VariantProps<typeof inputContainerVariants>, "disabled"> {
  field?: ControllerRenderProps<T, TName>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker<T extends FieldValues, TName extends Path<T>>({
  field: propField,
  placeholder = "Sélectionner une date",
  className,
  variant,
  size,
  disabled
}: DatePickerProps<T, TName>) {
  const contextField = useSmartField<T, TName>();
  const field = propField || contextField;

  // État local pour gérer la fermeture automatique du Popover après sélection
  const [isOpen, setIsOpen] = useState(false);

  if (!field) {
    throw new Error("DatePicker must be used within a SmartFormField or receive a 'field' prop.");
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled}
          className={cn(
            inputContainerVariants({ variant, size, disabled }),
            "justify-between text-left font-normal cursor-pointer hover:bg-opacity-0",
            !field.value && "text-muted-foreground", // field.value au lieu de date
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {field.value ? (
              // On s'assure que c'est bien une Date pour le formatage
              format(new Date(field.value), "EEEE d MMMM yyyy", { locale: fr })
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 bg-surface-elevated border-white-light text-white rounded-md shadow-xl" align="start">
        <Calendar
          mode="single"
          // Liaison avec React Hook Form :
          selected={field.value}
          onSelect={(date) => {
            field.onChange(date); // Met à jour le formulaire
            setIsOpen(false);     // Ferme le popover (UX)
          }}
          autoFocus
          locale={fr}
          className="p-3 pointer-events-auto"
          classNames={{
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "h-8 w-8 p-0 font-normal aria-selected:opacity-100 text-white rounded-full hover:bg-white/10 hover:text-white"
            ),
            day_selected:
              "bg-blue-600 text-white hover:bg-blue-500 hover:text-white focus:bg-blue-600 focus:text-white rounded-full",
            day_today:
              "bg-transparent text-blue-400 border border-blue-500/50 font-semibold rounded-full",
            day_outside: "text-muted-foreground opacity-30",
            day_disabled: "text-muted-foreground opacity-30",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

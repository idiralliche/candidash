import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { inputContainerVariants } from "./input";
import { VariantProps } from "class-variance-authority";

interface DatePickerProps extends Omit<VariantProps<typeof inputContainerVariants>, "disabled"> {
  date?: Date;
  onSelect?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "Sélectionner une date",
  className,
  variant,
  size,
  disabled
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          disabled={disabled}
          className={cn(
            inputContainerVariants({ variant, size, disabled }),
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {date ? (
            format(date, "EEEE d MMMM yyyy", { locale: fr })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 bg-surface-elevated border-white-light text-white rounded-md shadow-xl" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
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

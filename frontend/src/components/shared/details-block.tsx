import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  cva,
  type VariantProps,
} from "class-variance-authority"

const detailsBlockVariants = cva(
  "w-full",
  {
    variants: {
      variant: {
        textField: "whitespace-pre-wrap leading-relaxed text-sm text-gray-200 bg-surface-hover p-3 rounded-md border border-white-subtle font-medium text-pretty",
        card: "w-full mb-4",
        list: "grid grid-cols-1 gap-3"
      }
    },
    defaultVariants: {
      variant: "textField"
    }
  }
);

interface DetailsBlockProps extends VariantProps<typeof detailsBlockVariants> {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
  className?: string;
  itemsClassName?: string;
}

export function DetailsBlock({
  icon: Icon,
  label,
  children,
  className,
  itemsClassName,
  variant = "textField",
}: DetailsBlockProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2 select-none">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </h3>
      <div
        className={cn(detailsBlockVariants({ variant }), itemsClassName)}
      >
        {children}
      </div>
    </div>
  );
}

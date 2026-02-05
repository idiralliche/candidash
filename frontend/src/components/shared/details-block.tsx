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

export interface DetailsBlockTitleProps {
  label: string;
  icon: LucideIcon
  action?: ReactNode;
}

type DetailsBlockPropsComponent = {
  children: ReactNode;
  className?: string;
  itemsClassName?: string;
}

type DetailsBlockProps =
  DetailsBlockTitleProps &
  VariantProps<typeof detailsBlockVariants> &
  DetailsBlockPropsComponent;

export function DetailsBlock(props: DetailsBlockProps) {
  const variant = props.variant || 'textField';
  const { ...titleProps } = props as DetailsBlockTitleProps;
  const { children, className, itemsClassName } = props as DetailsBlockProps;

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center justify-between mb-2">
        <DetailsBlockTitle { ...titleProps }/>
      </div>

      <div
        className={cn(detailsBlockVariants({ variant }), itemsClassName)}
      >
        {children}
      </div>
    </div>
  );
}

export function DetailsBlockTitle ({
  label,
  icon: Icon,
  action,
} : DetailsBlockTitleProps) {
  return (
    <>
      <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 select-none">
        <Icon className="h-3.5 w-3.5" />
        <span className="first-letter:uppercase">{label}</span>
      </h3>
      {action && <div>{action}</div>}
    </>
  )
}

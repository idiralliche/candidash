import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailsBlockProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function DetailsBlock({
  icon: Icon,
  label,
  children,
  className,
  action
}: DetailsBlockProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2 select-none">
        <Icon className="h-3 w-3" />
        {label}
      </h3>
      <div className="text-sm text-gray-200 bg-surface-hover p-3 rounded-md border border-white-subtle font-medium break-words">
        {children}
        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  );
}

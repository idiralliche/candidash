import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailsBlockProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function DetailsBlock({
  icon: Icon,
  label,
  children,
  className,
}: DetailsBlockProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2 select-none">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </h3>
      {children}
    </div>
  );
}

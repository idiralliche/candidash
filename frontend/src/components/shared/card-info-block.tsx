import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardInfoBlockProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function CardInfoBlock({
  icon: Icon,
  children,
  className
}: CardInfoBlockProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs text-gray-400",
        className
      )}
    >
      {Icon &&
        <Icon className="h-3 w-3 shrink-0" />
      }
      <span className="truncate max-w-[150px]">
        {children}
      </span>
    </div>
  );
}

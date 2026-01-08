import { ExternalLink, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
  isExternal?: boolean;
  valueClassName?: string;
  variant?: "default" | "blue";
}

export function ActionCard({
  href,
  icon: Icon,
  label,
  value,
  isExternal,
  valueClassName,
  variant = "default"
}: ActionCardProps) {
  const isBlue = variant === "blue";

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-surface-hover border border-white-subtle transition-colors group",
        isBlue ? "hover:border-blue-500/50" : "hover:border-primary/50"
      )}
    >
      <div className={cn(
        "p-2 rounded transition-colors",
        isBlue
          ? "bg-blue-500/10 text-blue-400 group-hover:text-blue-300"
          : "bg-white-subtle text-gray-400 group-hover:text-white"
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={cn("text-sm text-white truncate", valueClassName)}>{value}</p>
      </div>
      {isExternal && <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-white" />}
    </a>
  );
}

import {
  ExternalLink,
  LucideIcon,
  Loader2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkCardProps {
  // Link mode
  href?: string;
  isExternal?: boolean;

  // Button mode
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;

  // Common props
  icon: LucideIcon;
  label: string;
  value: string;
  valueClassName?: string;
  variant?: "default" | "blue";
}

export function LinkCard({
  href,
  onClick,
  icon: Icon,
  label,
  value,
  isExternal,
  disabled,
  isLoading,
  valueClassName,
  variant = "default"
}: LinkCardProps) {
  const isBlue = variant === "blue";

  // Common container classes
  const containerClasses = cn(
    "flex w-full items-center gap-3 p-3 rounded-lg bg-surface-hover border border-white-subtle transition-colors group text-left",
    isBlue ? "hover:border-blue-500/50" : "hover:border-primary/50",
    (disabled || isLoading) && "opacity-70 cursor-not-allowed hover:border-white-subtle"
  );

  const iconClasses = cn(
    "p-2 rounded transition-colors shrink-0",
    isBlue
      ? "bg-blue-500/10 text-blue-400 group-hover:text-blue-300"
      : "bg-white-subtle text-gray-400 group-hover:text-white"
  );

  // Internal content (Icon + Text)
  const content = (
    <>
      <div className={iconClasses}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={cn("text-sm text-white truncate", valueClassName)}>{value}</p>
      </div>
      {/* Show external link icon only if not loading */}
      {!isLoading && (
        isExternal || !!href ?
          <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-white" /> :
            <Download className="h-4 w-4 text-gray-600 group-hover:text-white" />
      )}
    </>
  );

  // Conditional rendering: Link or Button
  if (href) {
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={containerClasses}
        // Prevent click on link if disabled/loading
        onClick={(e) => (disabled || isLoading) && e.preventDefault()}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={containerClasses}
    >
      {content}
    </button>
  );
}

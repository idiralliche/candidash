import { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EntityDetailsSheetProps {
  /** Entity title (e.g., entity name) */
  title: string;
  /** Optional badge (e.g., status, format) */
  badge?: ReactNode;
  /** Optional subtitle (e.g., type, position) */
  subtitle?: string;
  /** Optional metadata (e.g., date, duration) */
  metadata?: ReactNode;
  /** Edit handler (displays Edit button if provided) */
  onEdit?: () => void;
  /** Main sheet content */
  children: ReactNode;
  /** Footer actions (e.g., delete button) */
  footer?: ReactNode;
}

export function EntityDetailsSheet({
  title,
  badge,
  subtitle,
  metadata,
  onEdit,
  children,
  footer,
}: EntityDetailsSheetProps) {
  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6 pb-10">
        {/* HEADER */}
        <div className="space-y-2">
          {/* Optional badge */}
          {badge && <div>{badge}</div>}

          {/* Title + Edit Button Row */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold text-white leading-tight break-all">
              {title}
            </h2>

            {/* EDIT BUTTON */}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="border border-white-light"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Optional subtitle */}
          {subtitle && (
            <div className="text-lg text-gray-400">{subtitle}</div>
          )}

          {/* Optional metadata */}
          {metadata && (
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-1">
              {metadata}
            </div>
          )}
        </div>

        {/* CONTENT */}
        {children}

        {/* FOOTER (Delete Action, etc.) */}
        {footer && <div className="pt-6">{footer}</div>}
      </div>
    </ScrollArea>
  );
}

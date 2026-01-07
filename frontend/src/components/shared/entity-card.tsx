import { ReactNode } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DestructiveMenuItem } from '@/components/ui/dropdown-menu-item-destructive';

interface EntityCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Root component for entity cards.
 * Handles global layout, hover states, and click interactions.
 */
function EntityCard({ children, onClick, className }: EntityCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex flex-col sm:flex-row sm:items-center bg-surface-base border border-white-subtle rounded-xl p-4 gap-4 transition-all duration-200 hover:bg-surface-hover hover:border-primary/30 hover:shadow-md hover:-translate-y-[1px] cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Identity Zone (Left)
 * Contains the icon and title/subtitle.
 * Default width is w-48 (approx 12rem) to align columns across list items.
 */
function Identity({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 min-w-0 sm:w-48 shrink-0", className)}>
      {children}
    </div>
  );
}

/**
 * Info Helper (Title + Subtitle/Badge) inside Identity
 */
function Info({ title, subtitle, className }: { title: ReactNode; subtitle?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1 min-w-0", className)}>
      <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors">
        {title}
      </h3>
      {subtitle}
    </div>
  );
}

/**
 * Metadata Zone (Center / Right)
 * Flexible space for secondary info (location, stats, tags).
 */
function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-1 items-center justify-between sm:justify-end gap-6 text-sm text-gray-400 min-w-0", className)}>
      {children}
    </div>
  );
}

/**
 * Actions Zone (Far Right)
 * Includes the standard Dropdown menu (Edit/Delete).
 */
interface ActionsProps {
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  children?: ReactNode; // Allows adding custom actions before the menu
}

function Actions({ onEdit, onDelete, children }: ActionsProps) {
  return (
    <div className="absolute top-4 right-4 sm:static sm:pl-2 flex items-center gap-2">
      {children}

      {(onEdit || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              palette="gray"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-surface-base border-white-light text-white">
            {onEdit && (
              <DropdownMenuItem
                className="cursor-pointer focus:bg-white-light focus:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(e);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DestructiveMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete(e);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DestructiveMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// Composition
EntityCard.Identity = Identity;
EntityCard.Info = Info;
EntityCard.Meta = Meta;
EntityCard.Actions = Actions;

export { EntityCard };

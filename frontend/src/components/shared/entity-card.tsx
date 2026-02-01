import {
  ReactNode,
  isValidElement,
  createContext,
  useContext,
  MouseEvent,
} from 'react';

import {
  MoreHorizontal,
  Pencil,
  Trash2,
  LucideIcon,
} from 'lucide-react';

import {
  cva,
  type VariantProps,
} from "class-variance-authority"

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DestructiveMenuItem } from '@/components/ui/dropdown-menu-item-destructive';
import { Fab } from '@/components/ui/fab';
import { IconBox } from '@/components/ui/icon-box';
import { IconBoxProps } from '@/components/ui/icon-box';

// --- CONTEXT ---

// 1. Définition du type de la palette basé sur vos variants
type HoverPalette = VariantProps<typeof cardVariants>['hoverPalette'];

// 2. Création du contexte
const EntityCardContext = createContext<{
  smartHoverPalette: HoverPalette;
  isHighlighted?: boolean;
  isMinimal?: boolean;
} | null>(null);

// --- STYLES ---

// Card Hover Border Colors
const cardVariants = cva(
  "group relative grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center bg-surface-base border border-white-subtle rounded-xl p-4 gap-4 transition-all duration-200 hover:bg-surface-hover hover:shadow-md hover:-translate-y-[1px]",
  {
    variants: {
      hoverPalette: {
        primary: "hover:border-primary/30",
        blue: "hover:border-blue-500/30",
      }
    },
    defaultVariants: {
      hoverPalette: "primary"
    }
  }
);

// Title Hover Text Colors
const infoVariants = cva(
  "text-base font-bold text-white truncate transition-colors",
  {
    variants: {
      hoverPalette: {
        primary: "group-hover:text-primary",
        blue: "group-hover:text-blue-400",
      }
    },
    defaultVariants: {
      hoverPalette: "primary"
    }
  }
);

interface EntityCardProps extends VariantProps<typeof cardVariants> {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  isHighlighted?: boolean;
  isMinimal?: boolean;
}

/**
 * Root component for entity cards.
 * Handles global layout, hover states, and click interactions.
 */
function EntityCard({
  children,
  onClick,
  className,
  hoverPalette = "primary",
  isHighlighted = false,
  isMinimal = false,
}: EntityCardProps) {
  const isClickable=!!onClick;
  const smartHoverPalette=isHighlighted ? "blue" : hoverPalette;

  return (
    <EntityCardContext.Provider value={{ smartHoverPalette, isHighlighted, isMinimal }}>
      <div
        onClick={onClick}
        className={
          cn(cardVariants({ hoverPalette: smartHoverPalette }),
            isClickable ? "cursor-pointer" : "cursor-default",
            className
          )}
      >
        {children}
      </div>
    </EntityCardContext.Provider>
  );
}

interface IdentityProps {
  children: ReactNode;
  className?: string;
  iconBoxProps?: IconBoxProps;
  icon: LucideIcon | ReactNode;
}

/**
 * Identity Zone (Left)
 * Contains the icon and title/subtitle.
 * Default width is w-48 (approx 12rem) to align columns across list items.
 */
function Identity({
  children,
  className,
  iconBoxProps,
  icon,
}: IdentityProps) {

  const context = useContext(EntityCardContext);
  const { palette: propsPalette, ...restIconProps } = iconBoxProps || {};
  const renderIconContent = () => {
    if (!icon) return null;
    if (isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as LucideIcon;
    return <IconComponent className="h-5 w-5" />;
  };
  const iconBoxPalette = context?.isHighlighted ? "blue" : propsPalette;

  return (
    <div className={cn(
      "flex flex-col items-start gap-3 w-full",
      "md:flex-row md:items-center md:gap-4 md:w-48 md:shrink-0",
      context?.isMinimal ? "flex-row items-center gap-4 w-48 shrink-0" : "",
      className
    )}>

      {icon && (
        <IconBox
          groupHover
          {...restIconProps}
          palette={iconBoxPalette}
        >
          {renderIconContent()}
        </IconBox>
      )}
      {children}
    </div>
  );
}

/**
 * Info Helper (Title + Subtitle/Badge) inside Identity
 */
interface InfoProps extends VariantProps<typeof infoVariants> {
    title: ReactNode;
    subtitle?: ReactNode;
    className?: string;
}

function Info({
  title,
  subtitle,
  className,
}: InfoProps) {
  const context = useContext(EntityCardContext);
  return (
    <div className={cn(
       "flex flex-col gap-1 min-w-0 w-full",
      className
    )}>
      <h3
        className={cn(
          infoVariants({ hoverPalette: context?.smartHoverPalette})
        )}
      >
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
function Meta({
  children,
  className,
}: { children: ReactNode; className?: string }) {
  const context = useContext(EntityCardContext);
  if (context?.isMinimal) return null;

  return (
    <div className={cn(
      "flex flex-wrap items-center text-sm text-gray-400 min-w-0",
      "flex-col gap-2 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Actions Zone
 * Includes the standard Dropdown menu (Edit/Delete).
 */
interface ActionsProps {
  onEdit?: (e: MouseEvent) => void;
  onDelete?: (e: MouseEvent) => void;
  children?: ReactNode;
  className?: string
}

function Actions({
  onEdit,
  onDelete,
  children,
  className,
}: ActionsProps) {
  const context = useContext(EntityCardContext);
  if (context?.isMinimal) return null;

  const showDropdown = !!onEdit && !!onDelete;
  const showSingleEdit = !!onEdit && !onDelete;
  const showSingleDelete = !!onDelete && !onEdit;
  const showStandard = showDropdown || showSingleEdit || showSingleDelete;

  return (
    // MAIN CONTAINER
    <div className={cn(
      "col-span-1 w-full flex mt-2 md:col-span-1 md:w-auto md:mt-0 md:justify-end md:gap-2 md:items-center",
      className
    )}>

      {/* 1. CHILDREN (Custom Actions) */}
      {children && (
        <div className={cn(
          "flex w-full items-center gap-2",
          "justify-center",
          "md:w-auto md:justify-end"
        )}>
          {children}
        </div>
      )}

      {/* 2. STANDARD ACTIONS (Dropdown / Fab / Btn) */}
      {showStandard && (
        <div className="absolute top-4 right-4 md:static">

          {showDropdown && (
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
              <DropdownMenuContent
                align="end"
                className="bg-surface-base border-white-light text-white"
              >
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onEdit(e); }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </DropdownMenuItem>
                <DestructiveMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </DestructiveMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showSingleEdit && (
            <Fab
              variant="ghost"
              palette="blue"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onEdit!(e); }}
            >
              <Pencil className="h-4 w-4" />
            </Fab>
          )}

          {showSingleDelete && (
            <Fab
              variant="ghost"
              palette="primary"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onDelete!(e); }}
            >
              <Trash2 className="h-4 w-4" />
            </Fab>
          )}
        </div>
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

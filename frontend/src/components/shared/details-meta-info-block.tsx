import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wrap } from '@/components/ui/conditionnal-wrapper';

const detailsMetaInfoBlockVariants = cva(
  "flex items-center [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "gap-1",
        squareBadge: "gap-2 rounded border border-white-light bg-white-subtle px-3 py-1.5 text-gray-300",
      },
      firstLetterCase: {
        default: "",
        upperCase: "first-letter:uppercase",
      },
    },
    defaultVariants: {
      variant: "default",
      firstLetterCase: "default",
    }
  }
);

export function DetailsMetaInfoRowContainer ({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-2 w-full">
      {children}
    </div>
  );
}

interface DetailsMetaInfoBlockProps extends VariantProps<typeof detailsMetaInfoBlockVariants> {
  icon?: LucideIcon;
  label: string;
  className?: string;
}

export function DetailsMetaInfoBlock({
  icon: Icon,
  label,
  className,
  variant = "default",
  firstLetterCase = "default",
}: DetailsMetaInfoBlockProps) {
  return (
    <div className={cn(detailsMetaInfoBlockVariants({ variant }), className)}>
      {Icon &&
        <Icon className={variant === "squareBadge" ? "text-primary": ""} />
      }
      <span className={detailsMetaInfoBlockVariants({ firstLetterCase })} >{label}</span>
    </div>
  );
}

interface DetailsMetaLinkButtonProps extends VariantProps<typeof detailsMetaInfoBlockVariants> {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export function DetailsMetaLinkButton ({
  icon: Icon,
  label,
  href,
  onClick = undefined,
  isLoading = false,
}: DetailsMetaLinkButtonProps) {
  const hasHref = !!href;
  const hasOnClick = !!onClick;

  const wrapper= (content: ReactNode) : ReactNode => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {content}
    </a>
  );

  return ((hasHref && hasOnClick) && (
    <Button
      variant="outline"
      palette="blue"
      className="w-full justify-start"
      onClick={onClick}
      asChild={hasHref}
      disabled={!hasHref && !hasOnClick}
    >
      <Wrap
        condition={hasHref}
        with={wrapper}
      >
        <Icon className={isLoading ? "animate-spin" : ""}/>
        <span className="text-start w-full truncate block max-w-md">
          {label}
        </span>
      </Wrap>
    </Button>
  ));
}

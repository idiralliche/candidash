import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

interface EntitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

export function EntitySheet({
  open,
  onOpenChange,
  children,
  className,
}: EntitySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "sm:max-w-xl w-full border-l border-white-light bg-surface-base text-white",
          className
        )}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}

import { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

interface BasicDetailsProps {
  children: ReactNode;
  className?: string;
}

export function BasicDetails({
  children,
  className,
} : BasicDetailsProps) {
  return (
    <div
      className={cn(
        "whitespace-pre-wrap leading-relaxed text-sm text-gray-200 bg-surface-hover p-3 rounded-md border border-white-subtle font-medium text-pretty",
        className
      )}
    >
      {children}
    </div>
  )
}

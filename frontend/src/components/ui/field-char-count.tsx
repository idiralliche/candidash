import * as React from "react"
import { cn } from "@/lib/utils"
import { supportsCharCount } from '@/lib/utils';

interface FieldCharCountInfoProps {
  type?: React.HTMLInputTypeAttribute;
  showCharCount?: boolean;
  maxLength: number | undefined;
  remainingChars: number | undefined;
}

export function FieldCharCountInfo({
  type,
  showCharCount = true,
  maxLength,
  remainingChars,
}: FieldCharCountInfoProps) {
  // Early return if the character counter should not be displayed
  if (!showCharCount || maxLength === undefined || remainingChars === undefined || (type !== undefined && !supportsCharCount(type))) {
    return null;
  }

  // Determine the text color based on remaining characters
  const getTextColorClass = () => {
    if (remainingChars <= 0) return "text-destructive font-bold";

    if (maxLength <= 10) {
      if (remainingChars <= 1) return "text-destructive";
      if (remainingChars <= 2) return "text-orange-500";
      if (remainingChars <= 3) return "text-yellow-500";
      return "text-muted-foreground";
    }
    else if (maxLength <= 30) {
      if (remainingChars <= 2) return "text-destructive";
      if (remainingChars <= 4) return "text-orange-500";
      if (remainingChars <= 6) return "text-yellow-500";
      return "text-muted-foreground";
    }
    else if (maxLength <= 100) {
      if (remainingChars <= 5) return "text-destructive";
      if (remainingChars <= 10) return "text-orange-500";
      if (remainingChars <= 20) return "text-yellow-500";
      return "text-muted-foreground";
    }
    else {
      const critical = Math.max(5, Math.min(20, Math.floor(maxLength * 0.05)));
      if (remainingChars < critical) return "text-destructive";

      const warning = Math.max(10, Math.min(50, Math.floor(maxLength * 0.1)));
      if (remainingChars < warning) return "text-orange-500";

      const caution = Math.max(20, Math.min(100, Math.floor(maxLength * 0.15)));
      if (remainingChars < caution) return "text-yellow-500";

      return "text-muted-foreground";
    }
  };

  return (
    <div className="mt-1 flex justify-end">
      <span className={cn(
        "text-xs tabular-nums transition-colors font-medium",
        getTextColorClass()
      )}>
        {remainingChars} caractère{remainingChars !== 1 ? 's' : ''} restant{remainingChars !== 1 ?'s' : ''}
      </span>
    </div>
  );
}

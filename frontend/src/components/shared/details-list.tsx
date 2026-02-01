import { ReactNode } from "react";

interface DetailsListProps {
  children: ReactNode;
}

export function DetailsList({
  children,
} : DetailsListProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {children}
    </div>
  )
}

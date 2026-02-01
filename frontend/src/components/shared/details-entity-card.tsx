import { ReactNode } from "react";

interface DetailsEntityCardProps {
  children: ReactNode;
}

export function DetailsEntityCard({
  children,
} : DetailsEntityCardProps) {
  return (
    <div className="w-full mb-4">
      {children}
    </div>
  )
}

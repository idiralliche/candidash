import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Fab({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="solid"
      palette="primary"
      size="icon"
      className={cn("rounded-full shadow-lg", className)} // Force le style rond et l'ombre
      {...props}
    />
  );
}

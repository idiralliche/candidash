import {
  ReactNode,
  useState,
  useEffect,
  useCallback
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from "@/lib/utils";

export interface EntityDialogProps {
  title?: ReactNode | string;
  trigger?: ReactNode;
  description?: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  onFormsOpen: (close: () => void) => void;
}

export function EntityDialog({
  trigger,
  title,
  description,
  children,
  className,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onFormsOpen,
}: EntityDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if we are in controlled mode (props provided) or uncontrolled (internal state)
  const isControlled = controlledOpen !== undefined;

  const isOpen = isControlled ? controlledOpen : internalOpen;

  // If controlled, use external setter (if provided), otherwise use internal setter
  const setOpen = useCallback((value: boolean) => {
    if (isControlled && setControlledOpen) {
      setControlledOpen(value);
    } else {
      setInternalOpen(value);
    }
  },[isControlled,setControlledOpen]);

  useEffect(() => {
    function close() {
      setOpen(false);
    }
    onFormsOpen(close);
  }, [onFormsOpen, setOpen]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dialog open={isOpen} onOpenChange={setOpen}>
        {trigger && (
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
        )}
        <DialogContent
          className={cn(
            "sm:max-w-[600px] bg-surface-modal border-white-light text-white pt-15",
            className
          )}
          aria-describedby={description}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-gray-400">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          {children}

        </DialogContent>
    </Dialog>
    </div>
  );
}

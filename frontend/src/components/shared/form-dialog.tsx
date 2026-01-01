import { ReactNode, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FormDialogProps {
  /** The trigger button that opens the modal (Optional if controlled) */
  trigger?: ReactNode;
  /** Modal title */
  title: string;
  /** Description (optional) */
  description?: string;
  /** External control state (Optional) */
  open?: boolean;
  /** External state setter (Optional) */
  onOpenChange?: (open: boolean) => void;
  /** * Form content.
   * This is a function that receives 'close' as a parameter to close the modal on success.
   */
  children: (close: () => void) => ReactNode;
}

export function FormDialog({
  trigger,
  title,
  description,
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: FormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if we are in controlled mode (props provided) or uncontrolled (internal state)
  const isControlled = controlledOpen !== undefined;

  const isOpen = isControlled ? controlledOpen : internalOpen;
  // If controlled, use external setter (if provided), otherwise use internal setter
  const setOpen = (value: boolean) => {
    if (isControlled && setControlledOpen) {
      setControlledOpen(value);
    } else {
      setInternalOpen(value);
    }
  };

  function close() {
    setOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] bg-surface-modal border-white-light text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-gray-400">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Execute the render prop passing the close function */}
        {children(close)}

      </DialogContent>
    </Dialog>
  );
}

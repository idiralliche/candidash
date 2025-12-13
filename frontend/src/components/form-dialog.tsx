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
  /** The trigger button that opens the modal */
  trigger: ReactNode;
  /** Modal title */
  title: string;
  /** Description (optional) */
  description?: string;
  /** * Form content.
   * This is a function that receives 'close' as a parameter to close the modal on success.
   */
  children: (close: () => void) => ReactNode;
}

export function FormDialog({ trigger, title, description, children }: FormDialogProps) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#13151a] border-white/10 text-white">
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

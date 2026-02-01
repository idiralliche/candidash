import { ReactNode } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HTTPValidationError } from "@/api/model/hTTPValidationError";
import { FormSubmitButton } from '@/components/shared/form-submit-button';
import { cn } from "@/lib/utils";

interface SmartFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  children: ReactNode;
  className?: string;
  error?: HTTPValidationError | null;
  isPending?: boolean;
  isEditing?: boolean;
  entityType?: string;
  saveActionLabel?: string;
  editLabel?: ReactNode | string;
  footer?: ReactNode;
}

export function SmartForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  error,
  isPending = false,
  isEditing = false,
  entityType,
  saveActionLabel,
  editLabel,
}: SmartFormProps<T>) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "pr-2 max-h-[80vh] h-full",
          className
        )}
      >
        <ScrollArea className="h-full pr-4">
          <div className="space-y-5 p-1">
            {children}
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center animate-in fade-in slide-in-from-top-1">
              Une erreur est survenue lors de la création.
            </div>
          )}
          <div className="sticky bottom-0">
            <FormSubmitButton
              isPending={isPending}
              isEditing={isEditing}
              entityType={entityType}
              saveActionLabel={saveActionLabel}
              editLabel={editLabel}
              />
          </div>
        </ScrollArea>
      </form>
    </Form>
  );
}

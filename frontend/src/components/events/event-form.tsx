import { FormSubmitButton } from '@/components/shared/form-submit-button';
import { Form } from '@/components/ui/form';
import { EventFormFields } from '@/components/events/event-form-fields';

import { ScheduledEvent } from '@/api/model';
import { useEventFormLogic } from '@/hooks/scheduled-events/use-event-form-logic';
interface EventFormProps {
  onSuccess?: (event?: ScheduledEvent) => void;
  className?: string;
  initialData?: ScheduledEvent;
  defaultDate?: Date;
}

export function EventForm({ onSuccess, className, initialData, defaultDate }: EventFormProps) {
  const logic = useEventFormLogic({ initialData, defaultDate, onSuccess });

  return (
    <Form {...logic.form}>
      <form
        onSubmit={logic.onSubmit}
        className={`space-y-4 ${className} pr-2 max-h-[80vh] overflow-y-auto`}
      >
        <EventFormFields control={logic.form.control} />

        {logic.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de l'enregistrement.
          </div>
        )}

        <div className="sticky bottom-0">
          <FormSubmitButton
            isPending={logic.isPending}
            isEditing={logic.isEditing}
            entityType="événement"
            saveActionLabel="Planifier"
          />
        </div>
      </form>
    </Form>
  );
}

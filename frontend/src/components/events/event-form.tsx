import { SmartForm } from '@/components/shared/smart-form';
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
    <SmartForm
      form={logic.form}
      onSubmit={logic.onSubmit}
      isPending={logic.isPending}
      className={className}
      error={logic.error}
      isEditing={logic.isEditing}
      entityType="événement"
      saveActionLabel="Planifier"
    >
      <EventFormFields control={logic.form.control} />
    </SmartForm>
  );
}

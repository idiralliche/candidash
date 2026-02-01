import { SmartForm } from '@/components/shared/smart-form';
import { ActionFormFields } from '@/components/actions/action-form-fields';
import { useActionFormLogic } from '@/hooks/actions/use-action-form-logic';
import {
  Action,
  ScheduledEvent,
} from '@/api/model';

interface ActionFormProps {
  onSuccess?: (action?: Action) => void;
  className?: string;
  initialData?: Action;
  applicationId?: number | null;
  availableEvents?: ScheduledEvent[];
}

export function ActionForm({
  onSuccess,
  className,
  initialData,
  applicationId,
  availableEvents = [],
}: ActionFormProps) {

  const logic = useActionFormLogic({
    initialData,
    applicationId,
    availableEvents,
    onSuccess,
  });

  return (
    <SmartForm
      form={logic.form}
      onSubmit={logic.onSubmit}
      isPending={logic.isPending}
      className={className}
      error={logic.error}
      isEditing={logic.isEditing}
      entityType="action"
    >
      <ActionFormFields
        control={logic.form.control}
        register={logic.form.register}
        applications={logic.applications}
        isLoadingApps={logic.isLoadingApps}
        eventsList={logic.eventsList}
        isLoadingEvents={logic.isLoadingEvents}
        currentApplication={logic.currentApplication}
        isCompleted={logic.isCompleted}
        preselectedApplicationId={applicationId}
        applicationSelectRef={logic.applicationSelectTriggerRef}
      />
     </SmartForm>
  );
}

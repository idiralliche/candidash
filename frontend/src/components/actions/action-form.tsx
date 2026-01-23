import { Form } from '@/components/ui/form';
import { FormSubmitButton } from '@/components/shared/form-submit-button';
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
    <Form {...logic.form}>
      <form
        onSubmit={logic.onSubmit}
        className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}
      >
        <ActionFormFields
          control={logic.form.control}
          register={logic.form.register}
          // Data
          applications={logic.applications}
          isLoadingApps={logic.isLoadingApps}
          eventsList={logic.eventsList}
          isLoadingEvents={logic.isLoadingEvents}
          currentApplication={logic.currentApplication}
          // State
          isCompleted={logic.isCompleted}
          preselectedApplicationId={applicationId}
          applicationSelectRef={logic.applicationSelectTriggerRef}
        />

        {logic.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Une erreur est survenue lors de l'enregistrement.
          </div>
        )}

        <div className="sticky bottom-0">
          <FormSubmitButton
            isPending={logic.isPending}
            isEditing={logic.isEditing}
            entityType="action"
          />
        </div>
      </form>
    </Form>
  );
}

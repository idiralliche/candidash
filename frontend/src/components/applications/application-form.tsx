import { Form } from '@/components/ui/form';
import { ApplicationFormFields } from '@/components/applications/application-form-fields';
import { FormSubmitButton } from '@/components/shared/form-submit-button';

import { Application } from '@/api/model';
import { useApplicationFormLogic } from '@/hooks/applications/use-application-form-logic';

interface ApplicationFormProps {
  onSuccess?: () => void;
  className?: string;
  initialData?: Application;
}

export function ApplicationForm({
  onSuccess,
  className,
  initialData,
}: ApplicationFormProps) {

  const logic = useApplicationFormLogic({ initialData, onSuccess });

  return (
    <Form {...logic.form}>
      <form
        onSubmit={logic.onSubmit}
        className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}
      >

        <ApplicationFormFields
          control={logic.form.control}
          hideOpportunitySelect={false}
          hideArchiveSwitch={!logic.isEditing}
        />

        {/* ERROR MESSAGE */}
        {logic.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Une erreur est survenue lors de l'enregistrement.
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="sticky bottom-0">
          <FormSubmitButton
            isPending={logic.isPending}
            isEditing={logic.isEditing}
            entityType="candidature"
          />
        </div>
      </form>
    </Form>
  );
}

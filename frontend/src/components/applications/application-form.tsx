import { SmartForm } from '@/components/shared/smart-form';
import { ApplicationFormFields } from '@/components/applications/application-form-fields';
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
    <SmartForm
      form={logic.form}
      onSubmit={logic.onSubmit}
      isPending={logic.isPending}
      className={className}
      error={logic.error}
      isEditing={logic.isEditing}
      entityType="candidature"
    >
      <ApplicationFormFields
        control={logic.form.control}
        hideOpportunitySelect={false}
        hideArchiveSwitch={!logic.isEditing}
      />
    </SmartForm>
  );
}

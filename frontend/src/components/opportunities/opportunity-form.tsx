import { SmartForm } from '@/components/shared/smart-form';
import { Opportunity } from '@/api/model';
import { OpportunityFormFields } from '@/components/opportunities/opportunity-form-fields';
import { useOpportunityFormLogic } from '@/hooks/opportunities/use-opportunity-form-logic';

interface OpportunityFormProps {
  onSuccess?: () => void;
  className?: string;
  initialData?: Opportunity;
}

export function OpportunityForm({
  onSuccess,
  className,
  initialData
}: OpportunityFormProps) {

  const logic = useOpportunityFormLogic({ initialData, onSuccess });

  return (
    <SmartForm
      form={logic.form}
      onSubmit={logic.onSubmit}
      isPending={logic.isPending}
      className={className}
      error={logic.error}
      isEditing={logic.isEditing}
      entityType="opportunité"
    >
      <OpportunityFormFields control={logic.form.control} />
    </SmartForm>
  );
}

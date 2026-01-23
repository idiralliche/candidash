import { Opportunity } from '@/api/model';
import { OpportunityFormFields } from '@/components/opportunities/opportunity-form-fields';
import { FormSubmitButton } from '@/components/shared/form-submit-button';
import { Form } from '@/components/ui/form';

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
    <Form {...logic.form}>
      <form
        onSubmit={logic.onSubmit}
        className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}
      >

        <OpportunityFormFields control={logic.form.control} />

        {logic.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de la création de l'opportunité.
          </div>
        )}

        <div className="sticky bottom-0">
          <FormSubmitButton
            isPending={logic.isPending}
            isEditing={logic.isEditing}
            entityType="opportunité"
          />
        </div>
      </form>
    </Form>
  );
}

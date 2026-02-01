import { SmartForm } from '@/components/shared/smart-form';
import { OpportunityFormFields } from '@/components/opportunities/opportunity-form-fields';
import { ApplicationFormFields } from '@/components/applications/application-form-fields';
import { cn } from '@/lib/utils';

import { useWizardInitFormLogic } from '@/hooks/wizard/use-wizard-init-form-logic';

interface WizardStepInitFormProps {
  onSuccess: (applicationId: number, opportunityId: number) => void;
  className?: string;
}

export function WizardStepInitForm({ onSuccess, className }: WizardStepInitFormProps) {

  const logic = useWizardInitFormLogic({ onSuccess });

  return (
    <SmartForm
      form={logic.form}
      onSubmit={logic.onSubmit}
      isPending={logic.isPending}
      className={cn("max-h-max w-full", className)}
      error={logic.error}
      saveActionLabel="Créer et Continuer"
    >
      {/* Opportunity Section */}
      <div className="space-y-6 p-6">
        <h3 className="text-xl font-semibold text-primary">Opportunité</h3>
        <OpportunityFormFields control={logic.form.control} />
      </div>

      {/* Application Section */}
      <div className="space-y-6 p-6">
        <h3 className="text-xl font-semibold text-primary">Candidature</h3>
        <ApplicationFormFields
          control={logic.form.control}
          hideOpportunitySelect={true}
          hideArchiveSwitch={true}
        />
      </div>
    </SmartForm>
  );
}

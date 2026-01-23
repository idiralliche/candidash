import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { OpportunityFormFields } from '@/components/opportunities/opportunity-form-fields';
import { ApplicationFormFields } from '@/components/applications/application-form-fields';

import { useWizardInitFormLogic } from '@/hooks/wizard/use-wizard-init-form-logic';

interface WizardStepInitFormProps {
  onSuccess: (applicationId: number, opportunityId: number) => void;
  className?: string;
}

export function WizardStepInitForm({ onSuccess, className }: WizardStepInitFormProps) {

  const logic = useWizardInitFormLogic({ onSuccess });

  return (
    <Form {...logic.form}>
      <form
        onSubmit={logic.onSubmit}
        className={`space-y-8 ${className} pr-2 max-h-[70vh] overflow-y-auto`}
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

        {logic.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de la création. Vérifiez les champs.
          </div>
        )}

        <div className="sticky bottom-0">
          <Button
            type="submit"
            variant="solid"
            palette="primary"
            className="w-full"
            disabled={logic.isPending}
          >
            {logic.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Créer et Continuer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

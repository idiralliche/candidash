import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardStepId } from '@/config/wizard.config';

import { WizardState, WizardActions } from '@/hooks/wizard/use-wizard-store';

import { WizardStepInitForm } from './wizard-step-init-form';
import { WizardStepCompanies } from './wizard-step-companies';
import { WizardStepContacts } from './wizard-step-contacts';
import { WizardStepDocuments } from './wizard-step-documents';
import { WizardStepProducts } from './wizard-step-products';
import { WizardStepScheduledEvents } from './wizard-step-scheduled-events';
import { WizardStepActions } from './wizard-step-actions';
import { WizardStepSummary } from './wizard-step-summary';

interface WizardStepRendererProps {
  currentStep: WizardStepId;
  state: WizardState;
  actions: WizardActions;
  onInitSuccess: (appId: number, oppId: number) => void;
  onNext: () => void;
  onGoToStep: (id: number) => void;
}

export function WizardStepRenderer({
  currentStep,
  state,
  actions,
  onInitSuccess,
  onNext,
  onGoToStep
}: WizardStepRendererProps) {

  switch (currentStep) {
    case 1:
      return (
        <div className="p-6">
          {state.applicationId ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Opportunité initialisée</h3>
              <p className="text-gray-400 mb-6">L'opportunité et la candidature ont été créées.</p>
              <Button onClick={onNext} variant="solid" palette="primary">
                Continuer vers l'étape suivante <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <WizardStepInitForm onSuccess={onInitSuccess} />
          )}
        </div>
      );
    case 2:
      return (
        <div className="p-6">
          <WizardStepCompanies
            opportunityId={state.opportunityId}
            companies={state.createdCompanies}
            linkedCompanyId={state.linkedCompanyId}
            onCompanyAdded={actions.addCompany}
            onCompanyRemoved={actions.removeCompany}
            onLinkCompany={actions.setLinkedCompanyId}
          />
        </div>
      );
    case 3:
      return (
        <div className="p-6">
          <WizardStepContacts
            contacts={state.createdContacts}
            onContactAdded={actions.addContact}
            onContactRemoved={actions.removeContact}
          />
        </div>
      );
    case 4:
      return (
        <div className="p-6">
          <WizardStepDocuments
            applicationId={state.applicationId}
            documents={state.createdDocuments}
            onDocumentAdded={actions.addDocument}
            onDocumentRemoved={actions.removeDocument}
            resumeDocumentId={state.resumeDocumentId}
            coverLetterDocumentId={state.coverLetterDocumentId}
            onSetResume={actions.setResumeDocumentId}
            onSetCoverLetter={actions.setCoverLetterDocumentId}
          />
        </div>
      );
    case 5:
      return (
        <div className="p-6">
          <WizardStepProducts
            products={state.createdProducts}
            onProductAdded={actions.addProduct}
            onProductRemoved={actions.removeProduct}
          />
        </div>
      );
    case 6:
      return (
        <div className="p-6">
          <WizardStepScheduledEvents
            events={state.createdEvents}
            onEventAdded={actions.addEvent}
            onEventRemoved={actions.removeEvent}
          />
        </div>
      );
    case 7:
      return (
        <div className="p-6">
          <WizardStepActions
            applicationId={state.applicationId}
            actions={state.createdActions}
            onActionAdded={actions.addAction}
            onActionRemoved={actions.removeAction}
          />
        </div>
      );
    case 8:
      return (
        <div className="p-6">
          <WizardStepSummary state={state} onGoToStep={onGoToStep} />
        </div>
      );
    default:
      return null;
  }
}

import {
  useState,
  useEffect,
} from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  CheckCircle2,
  FileText,
  Briefcase,
  Calendar,
  Package,
  Contact,
  CheckCheck,
  ArrowRight,
  Building2,
  ListTodo,
} from 'lucide-react';
import { toast } from 'sonner';

// Layout Components
import { PageLayout } from '@/components/layouts/page-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { PageContent } from '@/components/layouts/page-content';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WizardStepper } from '@/components/wizard/wizard-stepper';
import { WizardStepInitForm } from '@/components/wizard/wizard-step-init-form';
import { WizardStepDocuments } from '@/components/wizard/wizard-step-documents';
import { WizardStepCompanies } from '@/components/wizard/wizard-step-companies';
import { WizardStepContacts } from '@/components/wizard/wizard-step-contacts';
import { WizardStepProducts } from '@/components/wizard/wizard-step-products';
import { WizardStepScheduledEvents } from '@/components/wizard/wizard-step-scheduled-events';
import { WizardStepActions } from '@/components/wizard/wizard-step-actions';
import { WizardStepSummary } from '@/components/wizard/wizard-step-summary';
import { useWizardStore } from '@/hooks/wizard/use-wizard-store';
import { IconBox } from '@/components/ui/icon-box';
import { WizardNavbar } from '@/components/wizard/wizard-navbar.tsx'

// Types for steps
export type WizardStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

type WizardStep = {
  id: WizardStepId;
  name: string;
  title: string;
  icon: typeof FileText;
  description: string;
};

// New 8-step order
const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    name: 'init',
    title: 'Initialisation',
    icon: Briefcase,
    description: 'Opportunité et candidature',
  },
  {
    id: 2,
    name: 'companies',
    title: 'Entreprises',
    icon: Building2,
    description: 'Entreprise concernée',
  },
  {
    id: 3,
    name: 'contacts',
    title: 'Contacts',
    icon: Contact,
    description: 'Contacts principaux',
  },
  {
    id: 4,
    name: 'documents',
    title: 'Documents',
    icon: FileText,
    description: 'Fichiers liés',
  },
  {
    id: 5,
    name: 'products',
    title: 'Produits',
    icon: Package,
    description: 'Produits concernés',
  },
  {
    id: 6,
    name: 'scheduledEvents',
    title: 'Événements',
    icon: Calendar,
    description: 'Événements associés',
  },
  {
    id: 7,
    name: 'actions',
    title: 'Actions',
    icon: CheckCheck,
    description: 'Actions à réaliser',
  },
  {
    id: 8,
    name: 'summary',
    title: 'Récapitulatif',
    icon: ListTodo,
    description: 'Résumé et confirmation',
  },
];

export function ApplicationWizardPage() {
  const navigate = useNavigate();
  const { state, setLastStep, ...actions } = useWizardStore();

  const stepDataMap: Record<number,  unknown[]> = {
    2: state.createdCompanies,
    3: state.createdContacts,
    4: state.createdDocuments,
    5: state.createdProducts,
    6: state.createdEvents,
    7: state.createdActions,
  };

  const hasItems = (stepId: number) => (stepDataMap[stepId]?.length ?? 0) > 0;

  const getInitialStep = (): WizardStepId => {
    if (state.lastStep && state.lastStep >= 1 && state.lastStep <= 8) {
      return state.lastStep as WizardStepId;
    }

    for (let i = 7; i >= 2; i--) {
      if (hasItems(i)) return i as WizardStepId;
    }
    return (state.applicationId && state.opportunityId) ? 2 : 1;
  };

  const [currentStep, setCurrentStep] = useState<WizardStepId>(getInitialStep);

  useEffect(() => {
    if (state.lastStep !== currentStep) {
      setLastStep(currentStep);
    }
  }, [currentStep, setLastStep, state.lastStep]);

  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    const steps = [];
    for(let i = 1; i < currentStep; i++) {
        steps.push(i);
    }
    if (state.applicationId && state.opportunityId && !steps.includes(1)) {
        steps.push(1);
    }
    return steps;
  });

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      handleStepComplete(currentStep);
      setCurrentStep(prev => (prev + 1) as WizardStepId);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStepId);
    }
  };

  const handleGoToStep = (stepId: number) => {
    setCurrentStep(stepId as WizardStepId);
  };

  const handleFinish = () => {
    actions.clearWizard();
    toast.success("Dossier de candidature créé avec succès !");
    navigate({ to: '/opportunities' });
  };

  const onInitSuccess = (appId: number, oppId: number) => {
    actions.setInitIds(appId, oppId);
    handleStepComplete(1);
    handleNext();
  };

  const currentStepData = WIZARD_STEPS.find(s => s.id === currentStep);
  const CurrentIcon = currentStepData?.icon;

  const showNextButton = currentStep === 1
    ? (!!state.applicationId)
    : hasItems(currentStep);

  return (
    <PageLayout>
      <PageHeader
        title="Assistant de Création"
        action={
          <Button
            variant="outline"
            onClick={() => {
                navigate({ to: '/opportunities' });
            }}
          >
            Annuler
          </Button>
        }
      />

      <PageContent>
        <WizardStepper
          currentStep={currentStep}
          steps={WIZARD_STEPS.map(step => ({
            id: step.id,
            title: step.title,
            icon: step.icon,
            // Disabled if not accessible (not current, not prev completed, not visited)
            disabled: !(step.id <= currentStep || completedSteps.includes(step.id - 1))
          }))}
          onStepClick={(id) => setCurrentStep(id as WizardStepId)}
          completedSteps={completedSteps}
        />


        <Card className="h-full flex flex-col border-white-light bg-surface-base rounded-t-none mt-2">
          {(currentStep > 1 && currentStep < 8) && (
            <>
              <WizardNavbar
                currentStep={currentStep}
                onNext={handleNext}
                onBack={handleBack}
                showNextButton={showNextButton}
              />
              <Separator className="bg-white-light"/>
            </>
          )}
          {/* Step Header */}
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              {CurrentIcon && (
                <IconBox>
                  <CurrentIcon className="h-6 w-6" />
                </IconBox>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-primary">
                  {currentStepData?.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentStepData?.description}
                </p>
              </div>
              <div className="text-sm text-muted-foreground bg-surface-alt px-3 py-1 rounded-full border border-border text-nowrap">
                Étape {currentStep} / {WIZARD_STEPS.length}
              </div>
            </CardTitle>
          </CardHeader>

          <Separator className="bg-white-light" />

          {/* Scrollable Step Content */}
          <CardContent className="flex-1 overflow-y-auto p-0">
            {currentStep === 1 && (
              <div className="p-6">
                  {state.applicationId ? (
                      <div className="text-center py-8">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-white mb-2">Opportunité initialisée</h3>
                          <p className="text-gray-400 mb-6">L'opportunité et la candidature ont été créées.</p>
                          <Button onClick={handleNext} variant="solid" palette="primary">
                              Continuer vers l'étape suivante
                              <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                      </div>
                  ) : (
                      <WizardStepInitForm onSuccess={onInitSuccess} />
                  )}
              </div>
            )}

            {currentStep === 2 && (
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
            )}

            {currentStep === 3 && (
              <div className="p-6">
                <WizardStepContacts
                  contacts={state.createdContacts}
                  onContactAdded={actions.addContact}
                  onContactRemoved={actions.removeContact}
                />
              </div>
            )}

            {currentStep === 4 && (
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
            )}

            {currentStep === 5 && (
              <div className="p-6">
                <WizardStepProducts
                  products={state.createdProducts}
                  onProductAdded={actions.addProduct}
                  onProductRemoved={actions.removeProduct}
                />
              </div>
            )}

            {currentStep === 6 && (
              <div className="p-6">
                <WizardStepScheduledEvents
                  events={state.createdEvents}
                  onEventAdded={actions.addEvent}
                  onEventRemoved={actions.removeEvent}
                />
              </div>
            )}

            {currentStep === 7 && (
              <div className="p-6">
                <WizardStepActions
                  applicationId={state.applicationId}
                  actions={state.createdActions}
                  onActionAdded={actions.addAction}
                  onActionRemoved={actions.removeAction}
                />
              </div>
            )}

            {currentStep === 8 && (
              <div className="p-6">
                <WizardStepSummary
                  state={state}
                  onGoToStep={handleGoToStep}
                />
              </div>
            )}
          </CardContent>


          {/* NAVBAR */}
          <Separator className="bg-white-light" />
          <CardFooter className="mt-6">
            <WizardNavbar
              currentStep={currentStep}
              onNext={handleNext}
              onBack={handleBack}
              onFinish={handleFinish}
              showNextButton={showNextButton}
            />
          </CardFooter>
        </Card>
      </PageContent>
    </PageLayout>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useWizardStore } from '@/hooks/wizard/use-wizard-store';
import { WIZARD_STEPS, WizardStepId } from '@/config/wizard.config';

export function useWizardNavigation() {
  const navigate = useNavigate();
  const { state, ...actions } = useWizardStore();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Step Data Logic
  const stepDataMap = useMemo(() => ({
    1: (state.applicationId && state.opportunityId) ? [1] : [],
    2: state.createdCompanies,
    3: state.createdContacts,
    4: state.createdDocuments,
    5: state.createdProducts,
    6: state.createdEvents,
    7: state.createdActions,
  } as Record<number, unknown[]>), [state]);

  const hasItems = (stepId: number) => (stepDataMap[stepId]?.length ?? 0) > 0;

  // Calculate Initial Step
  const getInitialStep = (): WizardStepId => {
    if (state.lastStep && state.lastStep >= 1 && state.lastStep <= 8) {
      return state.lastStep as WizardStepId;
    }
    for (let i = 7; i >= 1; i--) {
      if (hasItems(i)) return i as WizardStepId;
    }
    return 1;
  };

  const [currentStep, setCurrentStep] = useState<WizardStepId>(getInitialStep);

  // Sync Store
  useEffect(() => {
    if (state.lastStep !== currentStep) actions.setLastStep(currentStep);
    if ((state.highestVisitedStep || 0) < currentStep) actions.setHighestVisitedStep(currentStep);
  }, [currentStep, state.lastStep, state.highestVisitedStep, actions]);

  // Completed Steps
  const [completedSteps, setCompletedSteps] = useState<WizardStepId[]>(() => {
    const steps: number[] = [];
    for (let i = 1; i < WIZARD_STEPS.length; i++) {
      if (hasItems(i)) steps.push(i);
    }
    return steps as WizardStepId[];
  });

  const handleStepComplete = (stepId: WizardStepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  // Handlers
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      if (hasItems(currentStep)) handleStepComplete(currentStep);
      setCurrentStep(prev => (prev + 1) as WizardStepId);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => (prev - 1) as WizardStepId);
  };

  const handleGoToStep = (stepId: number) => setCurrentStep(stepId as WizardStepId);

  const handleFinish = () => {
    setCurrentStep(1);
    actions.clearWizard();
    toast.success("Dossier de candidature créé avec succès !");
    navigate({ to: '/opportunities' });
  };

  const handleConfirmExit = () => {
    setCurrentStep(1);
    actions.clearWizard();
    setIsCancelDialogOpen(false);
    navigate({ to: '/opportunities' });
  };

  const onInitSuccess = (appId: number, oppId: number) => {
    actions.setInitIds(appId, oppId);
    handleStepComplete(1);
    handleNext();
  };

  return {
    // State
    currentStep,
    completedSteps,
    isCancelDialogOpen,
    state,

    // Actions
    actions,
    setIsCancelDialogOpen,
    handleNext,
    handleBack,
    handleGoToStep,
    handleFinish,
    handleConfirmExit,
    onInitSuccess,

    // Helpers
    currentStepData: WIZARD_STEPS.find(step => step.id === currentStep),
    showNextButton: hasItems(currentStep),
  };
}

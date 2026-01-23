import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { IconBox } from '@/components/ui/icon-box';
import { PageLayout } from '@/components/layouts/page-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { PageContent } from '@/components/layouts/page-content';

// Refactored imports
import { WIZARD_STEPS } from '@/config/wizard.config';
import { useWizardNavigation } from '@/hooks/wizard/use-wizard-navigation';
import { WizardStepRenderer } from '@/components/wizard/wizard-step-renderer';

// Components
import { WizardStepper } from '@/components/wizard/wizard-stepper';
import { WizardNavbar } from '@/components/wizard/wizard-navbar';
import { WizardCancelDialog } from '@/components/wizard/wizard-cancel-dialog';

export function ApplicationWizardPage() {
  const nav = useWizardNavigation();
  const CurrentIcon = nav.currentStepData?.icon;

  return (
    <PageLayout>
      <PageHeader
        title="Assistant de Création"
        action={
          <Button variant="outline" onClick={() => nav.setIsCancelDialogOpen(true)}>
            Annuler
          </Button>
        }
      />

      <PageContent>
        <WizardStepper
          currentStep={nav.currentStep}
          steps={WIZARD_STEPS.map(step => ({
            id: step.id,
            title: step.title,
            icon: step.icon,
          }))}
          onStepClick={(id) => nav.handleGoToStep(id)}
          completedSteps={nav.completedSteps}
          highestVisitedStep={nav.state.highestVisitedStep || 1}
        />

        <Card className="h-full flex flex-col border-white-light bg-surface-base rounded-t-none mt-2">
          {(nav.currentStep > 1 && nav.currentStep < 8) && (
            <>
              <WizardNavbar
                currentStep={nav.currentStep}
                onNext={nav.handleNext}
                onBack={nav.handleBack}
                showNextButton={nav.showNextButton}
              />
              <Separator className="bg-white-light"/>
            </>
          )}

          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              {CurrentIcon && (
                <IconBox><CurrentIcon className="h-6 w-6" /></IconBox>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-primary">
                  {nav.currentStepData?.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {nav.currentStepData?.description}
                </p>
              </div>
              <div className="text-sm text-muted-foreground bg-surface-alt px-3 py-1 rounded-full border border-border text-nowrap">
                Étape {nav.currentStep} / {WIZARD_STEPS.length}
              </div>
            </CardTitle>
          </CardHeader>

          <Separator className="bg-white-light" />

          <CardContent className="flex-1 overflow-y-auto p-0">
            <WizardStepRenderer
              currentStep={nav.currentStep}
              state={nav.state}
              actions={nav.actions}
              onInitSuccess={nav.onInitSuccess}
              onNext={nav.handleNext}
              onGoToStep={nav.handleGoToStep}
            />
          </CardContent>

          <Separator className="bg-white-light" />

          <CardFooter className="mt-6">
            <WizardNavbar
              currentStep={nav.currentStep}
              onNext={nav.handleNext}
              onBack={nav.handleBack}
              onFinish={nav.handleFinish}
              showNextButton={nav.showNextButton}
            />
          </CardFooter>
        </Card>
      </PageContent>

      <WizardCancelDialog
        open={nav.isCancelDialogOpen}
        onOpenChange={nav.setIsCancelDialogOpen}
        onConfirm={nav.handleConfirmExit}
      />
    </PageLayout>
  );
}

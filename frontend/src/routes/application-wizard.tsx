import { createRoute } from '@tanstack/react-router';
import { authRoute } from '@/routes/_auth';
import { ApplicationWizardPage } from '@/pages/wizards/application-wizard-page';
import { WizardProvider } from '@/context/wizard-provider';

export const applicationWizardRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/application-wizard',
  component: ApplicationWizardPageWithProvider,
});

function ApplicationWizardPageWithProvider() {
  return (
    <WizardProvider>
      <ApplicationWizardPage />
    </WizardProvider>
  );
}

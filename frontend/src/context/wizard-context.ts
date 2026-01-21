import { createContext, useContext } from "react";

export interface WizardDraft {
  step: number;
  applicationId?: number;
  opportunityId?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData?: any;
  lastUpdated: string;
}

export interface WizardContextType {
  // State
  currentStep: number;
  applicationId: number | null;
  opportunityId: number | null;

  // Actions
  goToStep: (step: number) => void;
  setContextData: (data: { applicationId?: number; opportunityId?: number }) => void;

  // Storage Management
  hasSavedDraft: boolean;
  resumeDraft: () => void;
  clearDraft: () => void;
}

export const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
};

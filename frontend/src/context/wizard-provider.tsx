import React, { useState, useMemo, useCallback } from "react";
import { useUserProfile } from "@/hooks/account/use-user-profile";
import { WizardContext, WizardDraft } from "./wizard-context";

const WIZARD_STORAGE_KEY = "candidash_wizard_draft";

interface WizardProviderProps {
  children: React.ReactNode;
}

export function WizardProvider({ children }: WizardProviderProps) {
  const { user } = useUserProfile();

  const [currentStep, setCurrentStep] = useState(1);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [opportunityId, setOpportunityId] = useState<number | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(() => {
    // Immediate state initialization to avoid synchronous effect
    if (!user?.id) return false;
    const key = `${WIZARD_STORAGE_KEY}_${user.id}`;
    return !!localStorage.getItem(key);
  });

  const storageKey = useMemo(() => {
    if (!user?.id) return null;
    return `${WIZARD_STORAGE_KEY}_${user.id}`;
  }, [user?.id]);

  // Automatic draft saving - derived from state
  useMemo(() => {
    if (storageKey && (applicationId || opportunityId) && currentStep > 1) {
      const draft: WizardDraft = {
        step: currentStep,
        applicationId: applicationId || undefined,
        opportunityId: opportunityId || undefined,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
      // Note: hasSavedDraft will be updated via resumeDraft/clearDraft
    }
  }, [currentStep, applicationId, opportunityId, storageKey]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const setContextData = useCallback((data: { applicationId?: number; opportunityId?: number }) => {
    if (data.applicationId) setApplicationId(data.applicationId);
    if (data.opportunityId) setOpportunityId(data.opportunityId);
  }, []);

  const resumeDraft = useCallback(() => {
    if (!storageKey) return;

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const draft: WizardDraft = JSON.parse(saved);
        if (draft.applicationId) setApplicationId(draft.applicationId);
        if (draft.opportunityId) setOpportunityId(draft.opportunityId);
        if (draft.step) setCurrentStep(draft.step);
        setHasSavedDraft(true);
      } catch (e) {
        console.error("Error reading wizard draft", e);
        if (storageKey) {
          localStorage.removeItem(storageKey);
        }
        setHasSavedDraft(false);
      }
    }
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    setHasSavedDraft(false);
    setCurrentStep(1);
    setApplicationId(null);
    setOpportunityId(null);
  }, [storageKey]);

  const contextValue = useMemo(
    () => ({
      currentStep,
      applicationId,
      opportunityId,
      goToStep,
      setContextData,
      hasSavedDraft,
      resumeDraft,
      clearDraft,
    }),
    [
      currentStep,
      applicationId,
      opportunityId,
      goToStep,
      setContextData,
      hasSavedDraft,
      resumeDraft,
      clearDraft,
    ]
  );

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
}

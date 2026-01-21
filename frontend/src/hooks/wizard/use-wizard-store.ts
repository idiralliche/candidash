import { useState, useEffect } from 'react';
import {
  Document,
  Contact,
  Company,
  ScheduledEvent,
  Action,
  Product,
} from '@/api/model';

interface WizardState {
  applicationId: number | null;
  opportunityId: number | null;
  linkedCompanyId: number | null;
  resumeDocumentId: number | null;
  coverLetterDocumentId: number | null;
  createdDocuments: Document[];
  createdContacts: Contact[];
  createdCompanies: Company[];
  createdProducts: Product[];
  createdEvents: ScheduledEvent[];
  createdActions: Action[];
  lastStep?: number;
}

const STORAGE_KEY = 'wizard_session_v1';

const INITIAL_STATE: WizardState = {
  applicationId: null,
  opportunityId: null,
  linkedCompanyId: null,
  resumeDocumentId: null,
  coverLetterDocumentId: null,
  createdDocuments: [],
  createdContacts: [],
  createdCompanies: [],
  createdProducts: [],
  createdEvents: [],
  createdActions: [],
  lastStep: 1,
};

export function useWizardStore() {
  // Lazy initialization to load from storage synchronously on mount
  const [state, setState] = useState<WizardState>(() => {
    if (typeof window === 'undefined') return INITIAL_STATE;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with INITIAL_STATE to ensure that the new fields exist
        return { ...INITIAL_STATE, ...parsed };
      } catch (e) {
        console.error("Failed to parse wizard state", e);
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  // Persist to localStorage on state change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Actions
  const setLastStep = (step: number) => {
    setState(prev => ({ ...prev, lastStep: step }));
  };

  const setInitIds = (appId: number, oppId: number) => {
    setState(prev => ({ ...prev, applicationId: appId, opportunityId: oppId }));
  };

  const setLinkedCompanyId = (companyId: number | null) => {
    setState(prev => ({ ...prev, linkedCompanyId: companyId }));
  };

  const setResumeDocumentId = (docId: number | null) => {
    setState(prev => ({
      ...prev,
      resumeDocumentId: docId,
      coverLetterDocumentId: prev.coverLetterDocumentId === docId ? null : prev.coverLetterDocumentId
    }));
  };

  const setCoverLetterDocumentId = (docId: number | null) => {
    setState(prev => ({
      ...prev,
      coverLetterDocumentId: docId,
      resumeDocumentId: prev.resumeDocumentId === docId ? null : prev.resumeDocumentId
    }));
  };

  const addDocument = (doc: Document) => {
    setState(prev => ({ ...prev, createdDocuments: [...prev.createdDocuments, doc] }));
  };

  const removeDocument = (id: number) => {
    setState(prev => ({
      ...prev,
      createdDocuments: prev.createdDocuments.filter(d => d.id !== id),
      resumeDocumentId: prev.resumeDocumentId === id ? null : prev.resumeDocumentId,
      coverLetterDocumentId: prev.coverLetterDocumentId === id ? null : prev.coverLetterDocumentId
    }));
  };

  const addContact = (contact: Contact) => {
    setState(prev => ({ ...prev, createdContacts: [...prev.createdContacts, contact] }));
  };

  const removeContact = (id: number) => {
    setState(prev => ({ ...prev, createdContacts: prev.createdContacts.filter(c => c.id !== id) }));
  };

  const addCompany = (company: Company) => {
    setState(prev => ({ ...prev, createdCompanies: [...prev.createdCompanies, company] }));
  };

  const removeCompany = (id: number) => {
    setState(prev => ({
      ...prev,
      createdCompanies: prev.createdCompanies.filter(c => c.id !== id),
      linkedCompanyId: prev.linkedCompanyId === id ? null : prev.linkedCompanyId
    }));
  };

  const addProduct = (product: Product) => {
    setState(prev => ({ ...prev, createdProducts: [...prev.createdProducts, product] }));
  };

  const removeProduct = (id: number) => {
    setState(prev => ({ ...prev, createdProducts: prev.createdProducts.filter(p => p.id !== id) }));
  };

  const addEvent = (event: ScheduledEvent) => {
    setState(prev => ({ ...prev, createdEvents: [...prev.createdEvents, event] }));
  };

  const removeEvent = (id: number) => {
    setState(prev => ({ ...prev, createdEvents: prev.createdEvents.filter(e => e.id !== id) }));
  };

  const addAction = (action: Action) => {
    setState(prev => ({ ...prev, createdActions: [...prev.createdActions, action] }));
  };

  const removeAction = (id: number) => {
    setState(prev => ({ ...prev, createdActions: prev.createdActions.filter(a => a.id !== id) }));
  };

  const clearWizard = () => {
    setState(INITIAL_STATE);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    state,
    setLastStep,
    setInitIds,
    setLinkedCompanyId,
    setResumeDocumentId,
    setCoverLetterDocumentId,
    addDocument,
    removeDocument,
    addContact,
    removeContact,
    addCompany,
    removeCompany,
    addProduct,
    removeProduct,
    addEvent,
    removeEvent,
    addAction,
    removeAction,
    clearWizard,
  };
}

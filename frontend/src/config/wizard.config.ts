import {
  Layers,
  Building2,
  Contact,
  Files,
  Package,
  CalendarClock,
  CheckCheck,
  ListTodo,
  LucideIcon
} from 'lucide-react';

export type WizardStepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type WizardStep = {
  id: WizardStepId;
  name: string;
  title: string;
  icon: LucideIcon;
  description: string;
};

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    name: 'init',
    title: 'Initialisation',
    icon: Layers,
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
    icon: Files,
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
    icon: CalendarClock,
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

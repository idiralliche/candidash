import {
  AlertTriangle,
  Pencil,
  Briefcase,
  Building2,
  Contact,
  FileText,
  Package,
  Calendar,
  CheckCheck,
  LucideIcon,
  Mail,
  FileCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Hooks & Types
import {
  Document,
  Contact as ContactType,
  Company,
  Product,
  ScheduledEvent,
  Action,
} from '@/api/model';
import { useGetOpportunityApiV1OpportunitiesOpportunityIdGet } from '@/api/opportunities/opportunities';
import { useGetApplicationApiV1ApplicationsApplicationIdGet } from '@/api/applications/applications';
import { OpportunityCard } from '@/components/opportunities/opportunity-card.tsx';
import { ApplicationCard } from '@/components/applications/application-card.tsx';
import { CompanyCard } from '@/components/companies/company-card';
import { ContactCard } from '@/components/contacts/contact-card';
import { DocumentCard } from '@/components/documents/document-card';
import { ProductCard } from '@/components/products/product-card';
import { EventCard } from '@/components/events/event-card';
import { ActionCard } from '@/components/actions/action-card';

interface WizardState {
  applicationId: number | null;
  opportunityId: number | null;
  linkedCompanyId: number | null;
  resumeDocumentId: number | null;
  coverLetterDocumentId: number | null;
  createdDocuments: Document[];
  createdContacts: ContactType[];
  createdCompanies: Company[];
  createdProducts: Product[];
  createdEvents: ScheduledEvent[];
  createdActions: Action[];
}

interface WizardStepSummaryProps {
  state: WizardState;
  onGoToStep: (stepId: number) => void;
}

// --- Sub-components ---

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
  count?: number;
  onEdit?: () => void;
}

const SectionHeader = ({
  title,
  icon: Icon,
  count,
  onEdit
}: SectionHeaderProps) => (
  <div className="flex items-center justify-between mb-4 mt-8">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
        {title}
        {count !== undefined && (
          <span className="text-sm font-normal text-muted-foreground bg-surface-alt px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </h3>
    </div>
    {onEdit && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="text-muted-foreground hover:text-white"
      >
        <Pencil className="h-4 w-4 mr-2" />
        Modifier
      </Button>
    )}
  </div>
);

const EmptySectionAlert = ({ message }: { message: string }) => (
  <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/80 text-sm">
    <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
    {message}
  </div>
);

// --- Main Component ---

export function WizardStepSummary({
  state,
  onGoToStep,
}: WizardStepSummaryProps) {
  // Fetch details for the header
  const { data: opportunity } = useGetOpportunityApiV1OpportunitiesOpportunityIdGet(
    state.opportunityId ?? 0,
    { query: { enabled: !!state.opportunityId } }
  );

  const { data: application } = useGetApplicationApiV1ApplicationsApplicationIdGet(
    state.applicationId ?? 0,
    { query: { enabled: !!state.applicationId } }
  );

  return (
    <div className="space-y-2 pb-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">Tout est prêt ?</h2>
        <p className="text-muted-foreground">
          Vérifiez les informations ci-dessous avant de valider la création de votre dossier de candidature.
          Vous pourrez toujours modifier ces éléments plus tard.
        </p>
      </div>

      {/* 1. INITIALISATION */}
      <SectionHeader
        title="Opportunité & Candidature"
        icon={Briefcase}
      />
      {opportunity && application ? (
        <>
          <OpportunityCard opportunity={opportunity} />
          <ApplicationCard application={application} />
        </>
      ) : (
          <div className="text-sm text-muted-foreground animate-pulse">Chargement des détails...</div>
      )}

      <Separator className="bg-white-light mt-10 mb-10" />

      {/* 2. Companies */}
      <SectionHeader
        title="Entreprises"
        icon={Building2}
        count={state.createdCompanies.length}
        onEdit={() => onGoToStep(2)}
      />
      {state.createdCompanies.length === 0 ? (
        <EmptySectionAlert message="Aucune entreprise créée. Il est recommandé d'associer une entreprise à l'opportunité." />
      ) : (
        state.createdCompanies.map(company => (
          <CompanyCard
            key={company.id}
            company={company}
            isHighlighted={state.linkedCompanyId === company.id}
            variant="compact"
          />
        ))
      )}

      <Separator className="bg-white-light mt-10 mb-10" />

      {/* 3. CONTACTS */}
      <SectionHeader
        title="Contacts"
        icon={Contact}
        count={state.createdContacts.length}
        onEdit={() => onGoToStep(3)}
      />
      {state.createdContacts.length === 0 ? (
        <EmptySectionAlert message="Aucun contact ajouté." />
      ) : (
        state.createdContacts.map(contact => (
          <ContactCard
            key={contact.id}
            contact={contact}
          />
        ))
      )}

      <Separator className="bg-white-light mt-10 mb-10" />

      {/* 4. DOCUMENTS */}
      <SectionHeader
        title="Documents"
        icon={FileText}
        count={state.createdDocuments.length}
        onEdit={() => onGoToStep(4)}
      />
      {state.createdDocuments.length === 0 ? (
        <EmptySectionAlert message="Aucun document joint (CV, Lettre...)." />
      ) : (
        state.createdDocuments.map(doc => (
          <DocumentCard
            document={doc}
            variant="compact"
            isHighlighted={state.resumeDocumentId === doc.id || state.coverLetterDocumentId === doc.id}
            badges={(state.resumeDocumentId === doc.id || state.coverLetterDocumentId === doc.id) && (
              <Badge
                variant="subtle"
                palette="blue"
              >
                {state.resumeDocumentId === doc.id ? (
                  <>
                    <FileCheck className="h-3 w-3" />
                    CV
                  </>
                ) : (
                  <>
                    <Mail className="h-3 w-3" />
                    LM
                  </>
                )}
              </Badge>
            )}
          />
        ))
      )}

      <Separator className="bg-white-light mt-10 mb-10" />

      {/* 5. PRODUCTS */}
      <SectionHeader
        title="Produits"
        icon={Package}
        count={state.createdProducts.length}
        onEdit={() => onGoToStep(5)}
      />
      {state.createdProducts.length > 0 ? (
        state.createdProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            variant="compact"
          />
        ))
      ) : (
          <div className="text-sm text-muted-foreground italic pl-2">Aucun produit associé (Optionnel).</div>
      )}

      <Separator className="bg-white-light mt-10 mb-10" />

      {/* 6. EVENTS */}
      <SectionHeader
        title="Événements"
        icon={Calendar}
        count={state.createdEvents.length}
        onEdit={() => onGoToStep(6)}
      />
      {state.createdEvents.length > 0 ? (
          state.createdEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
          />
        ))
      ) : (
          <div className="text-sm text-muted-foreground italic pl-2">Aucun événement planifié (Optionnel).</div>
      )}

      <Separator className="bg-white-light mt-10 mb-10" />

      {/* 7. ACTIONS */}
      <SectionHeader
        title="Actions"
        icon={CheckCheck}
        count={state.createdActions.length}
        onEdit={() => onGoToStep(7)}
      />
      <div className="flex flex-col gap-3">
        {state.createdActions.length === 0 ? (
          <EmptySectionAlert message="Aucune action définie. Pensez à noter vos prochaines tâches." />
        ) : (
          state.createdActions.map(action => (
            <ActionCard
              key={action.id}
              action={action}
            />
          ))
        )}
      </div>
    </div>
  );
}

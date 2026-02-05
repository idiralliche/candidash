import { ReactNode, useMemo } from 'react';
import { Users, Briefcase } from 'lucide-react';

import { OpportunityContact } from '@/api/model';
import { useOpportunityContacts } from '@/hooks/opportunity-contacts/use-opportunity-contacts';
import { useDeleteOpportunityContact } from '@/hooks/opportunity-contacts/use-delete-opportunity-contact';
import { useEntityAssociation } from '@/hooks/associations/use-entity-association';
import { AssociationManager } from '@/components/shared/association-manager';
import { OpportunityContactForm } from './opportunity-contact-form';
import { OpportunityContactCard } from './opportunity-contact-card';
import { genderMap } from '@/lib/semantic-ui';

/**
 * Configuration for each relation type
 */
const RELATION_CONFIG = {
  opportunity: {
    icon: Briefcase,
    currentSide: 'opportunité' as const,
    otherSide: 'contact' as const,
    apiField: 'opportunity_id' as const,
    cardType: 'contact' as const,
    getLabel: (assoc: OpportunityContact) =>
      assoc.contact ? `${assoc.contact.first_name} ${assoc.contact.last_name}` : '',
  },
  contact: {
    icon: Users,
    currentSide: 'contact' as const,
    otherSide: 'opportunité' as const,
    apiField: 'contact_id' as const,
    cardType: 'opportunity' as const,
    getLabel: (assoc: OpportunityContact) => assoc.opportunity?.job_title || '',
  },
} as const;

type RelationType = keyof typeof RELATION_CONFIG;

/**
 * Component props
 */
interface OpportunitiesContactsListProps {
  /** Opportunity ID (mode: opportunity -> contacts) */
  opportunityId?: number;
  /** Contact ID (mode: contact -> opportunities) */
  contactId?: number;
  /** Integration context */
  integrationContext: 'card' | 'details';
  /** Custom trigger for dialog (card mode only) */
  trigger?: ReactNode;
}

/**
 * Generic component to manage Opportunities-Contacts associations
 * Works in both directions: Opportunity->Contacts or Contact->Opportunities
 */
export function OpportunitiesContactsList({
  opportunityId,
  contactId,
  integrationContext,
  trigger,
}: OpportunitiesContactsListProps) {

  // ========== CONFIGURATION ==========
  const relationType: RelationType = opportunityId ? 'opportunity' : 'contact';
  const entityId = (opportunityId ?? contactId)!;
  const config = RELATION_CONFIG[relationType];

  const {
    demonstrative: currentSideDemonstrative,
  } = genderMap[config.currentSide];

  const {
    article: otherSideArticle,
    suffix: otherSideSuffix,
  } = genderMap[config.otherSide];

  // ========== DATA FETCHING ==========
  const { opportunityContacts, isLoading } = useOpportunityContacts({
    [config.apiField]: entityId,
  });

  const { mutateAsync: deleteAssoc, isPending: isDeleting } = useDeleteOpportunityContact();

  // ========== STATE MANAGEMENT ==========
  const association = useEntityAssociation({
    data: opportunityContacts,
    isLoading,
    onDelete: (assocId) => deleteAssoc({ associationId: assocId }),
    isDeleting,
  });

  // ========== RENDER FUNCTIONS ==========
  const renderItem = (
    assoc: OpportunityContact,
    onEdit: (item: OpportunityContact) => void,
    onDelete: (item: OpportunityContact) => void
  ) => (
    <OpportunityContactCard
      key={assoc.id}
      assoc={assoc}
      type={config.cardType}
      title={config.getLabel(assoc)}
      isHighlighted={assoc.is_primary_contact}
      onEdit={() => onEdit(assoc)}
      onDelete={() => onDelete(assoc)}
    />
  );

  // ========== LABELS ==========
  const labels = useMemo(() => ({
    list: `${config.otherSide}s lié${otherSideSuffix}s`,
    empty: `Aucun${otherSideSuffix} ${config.otherSide} associé${otherSideSuffix} à ${currentSideDemonstrative} ${config.currentSide}.`,
    createTitle: `Associer un${otherSideSuffix} ${config.otherSide}`,
    createDescription: `Liez un${otherSideSuffix} ${config.otherSide} existant${otherSideSuffix} à ${currentSideDemonstrative} ${config.currentSide}.`,
    editTitle: 'Modifier la relation',
    editDescription: `Mettez à jour le rôle ou les notes de cette association ${config.currentSide}-${config.otherSide}.`,
    deleteDescription: `Cette action supprimera cette association. ${otherSideArticle}${config.otherSide} ne sera pas supprimé${otherSideSuffix}.`,
  }), [config, otherSideSuffix, otherSideArticle, currentSideDemonstrative]);

  // ========== RENDER ==========
  return (
    <AssociationManager
      // Display
      label={labels.list}
      icon={config.icon}
      emptyMessage={labels.empty}

      // Data
      items={association.data}
      isLoading={association.isLoading}

      // Render
      renderItem={renderItem}

      // Forms
      createForm={(close) => (
        <OpportunityContactForm
          {...(relationType === 'contact'
            ? { preselectedContactId: entityId }
            : { preselectedOpportunityId: entityId }
          )}
          onSuccess={() => {
            close();
            association.resetForms();
          }}
        />
      )}
      editForm={(item, close) => (
        <OpportunityContactForm
          initialData={item}
          onSuccess={() => {
            close();
            association.resetForms();
          }}
        />
      )}
      createTitle={labels.createTitle}
      createDescription={labels.createDescription}
      editTitle={labels.editTitle}
      editDescription={labels.editDescription}

      // Actions
      onCreateOpen={association.setIsCreateOpen}
      onEditItem={association.setEditingItem}
      onDeleteItem={association.setDeletingItem}
      onConfirmDelete={association.handleDelete}

      // State
      isCreateOpen={association.isCreateOpen}
      editingItem={association.editingItem}
      deletingItem={association.deletingItem}
      isDeleting={association.isDeleting}

      // Context
      mode={integrationContext === 'card' ? 'dialog' : 'details'}
      trigger={trigger}

      // Delete labels
      deleteEntityType="association"
      getDeleteLabel={config.getLabel}
      deleteDescription={labels.deleteDescription}
    />
  );
}

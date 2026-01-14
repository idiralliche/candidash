import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, Briefcase } from 'lucide-react';

import { useOpportunities } from '@/hooks/opportunities/use-opportunities';
import { useDeleteOpportunity } from '@/hooks/opportunities/use-delete-opportunity';
import { Opportunity } from '@/api/model';

import { Fab } from '@/components/ui/fab';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { EmptyState } from '@/components/shared/empty-state';

// Layout Components
import { PageLayout } from '@/components/layouts/page-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { PageContent } from '@/components/layouts/page-content';

// Shared Components
import { EntitySheet } from '@/components/shared/entity-sheet';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';
import { FormDialog } from '@/components/shared/form-dialog';

// Feature Components
import { OpportunityForm } from '@/components/opportunities/opportunity-form';
import { OpportunityDetails } from '@/components/opportunities/opportunity-details';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';

export function OpportunitiesPage() {
  const { opportunities, isLoading } = useOpportunities();
  const { mutate: deleteOpportunity, isPending: isDeleting } = useDeleteOpportunity();

  // State
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  // Alphabetical sorting for list view
  const sortedOpportunities = useMemo(() => {
    if (!opportunities) return [];
    return [...opportunities].sort((a, b) =>
      a.job_title.localeCompare(b.job_title)
    );
  }, [opportunities]);

  const handleDelete = async () => {
    if (!opportunityToDelete) return;
    setDeleteError('');
    try {
      await deleteOpportunity({ opportunityId: opportunityToDelete.id });
      toast.success('Opportunité supprimée avec succès');
      setOpportunityToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setDeleteError('Une erreur est survenue lors de la suppression.');
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Opportunités"
        action={
          <FormDialog
            title="Nouvelle Opportunité"
            description="Ajoutez une nouvelle opportunité à votre pipeline."
            trigger={
              <Fab>
                <Plus className="h-5 w-5" />
              </Fab>
            }
          >
            {(close) => <OpportunityForm onSuccess={close} />}
          </FormDialog>
        }
      />

      <PageContent>
        {isLoading ? (
          <CardListSkeleton />
        ) : sortedOpportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            message="Aucune opportunité trouvée. Commencez par en ajouter une !"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {sortedOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onClick={setSelectedOpportunity}
                onEdit={setEditingOpportunity}
                onDelete={setOpportunityToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!selectedOpportunity}
        onOpenChange={(open) => !open && setSelectedOpportunity(null)}
        title="Détails de l'opportunité"
      >
        {selectedOpportunity && (
          <OpportunityDetails
            opportunity={selectedOpportunity}
            onEdit={(op) => {
              setSelectedOpportunity(null);
              setEditingOpportunity(op);
            }}
            onDelete={(op) => {
              setSelectedOpportunity(null);
              setOpportunityToDelete(op);
            }}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!editingOpportunity}
        onOpenChange={(open) => !open && setEditingOpportunity(null)}
        title="Modifier l'opportunité"
        description="Mettez à jour les informations du poste."
      >
        {(close) => editingOpportunity && (
          <OpportunityForm
            initialData={editingOpportunity}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!opportunityToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setOpportunityToDelete(null);
            setDeleteError('');
          }
        }}
        entityType="opportunité"
        entityLabel={opportunityToDelete?.job_title || ''}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </PageLayout>
  );
}

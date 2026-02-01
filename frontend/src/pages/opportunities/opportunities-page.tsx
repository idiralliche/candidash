import { Briefcase, Plus, Wand2 } from 'lucide-react';

import { useOpportunitiesPage } from '@/hooks/opportunities/use-opportunities-page';

import { Button } from '@/components/ui/button.tsx';
import { Fab } from '@/components/ui/fab';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { EmptyState } from '@/components/shared/empty-state';
import { EntitySheet } from '@/components/shared/entity-sheet';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';
import { FormDialog } from '@/components/shared/form-dialog';

import { PageLayout } from '@/components/layouts/page-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { PageContent } from '@/components/layouts/page-content';

import { OpportunityForm } from '@/components/opportunities/opportunity-form';
import { OpportunityDetails } from '@/components/opportunities/opportunity-details';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';

export function OpportunitiesPage() {
  const logic = useOpportunitiesPage();

  return (
    <PageLayout>
      <PageHeader
        title="Opportunités"
        secondaryAction={
          <Button
            variant="outline"
            palette="primary"
            onClick={logic.navigateToWizard}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Assistant Candidature
          </Button>
        }
        action={
            <FormDialog
              title="Nouvelle Opportunité"
              description="Ajoutez une nouvelle opportunité à votre pipeline."
              trigger={<Fab><Plus className="h-5 w-5" /></Fab>}
            >
              {(close) => <OpportunityForm onSuccess={close} />}
            </FormDialog>
        }
      />

      <PageContent>
        {logic.isLoading ? (
          <CardListSkeleton />
        ) : logic.sortedOpportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            message="Aucune opportunité trouvée. Commencez par en ajouter une !"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {logic.sortedOpportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onClick={logic.setSelectedOpportunity}
                onEdit={logic.setEditingOpportunity}
                onDelete={logic.setOpportunityToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!logic.selectedOpportunity}
        onOpenChange={(open) => !open && logic.setSelectedOpportunity(null)}
      >
        {logic.selectedOpportunity && (
          <OpportunityDetails
            opportunity={logic.selectedOpportunity}
            onEdit={logic.handleEditFromDetails}
            onDelete={logic.handleDeleteFromDetails}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!logic.editingOpportunity}
        onOpenChange={(open) => !open && logic.setEditingOpportunity(null)}
        title="Modifier l'opportunité"
        description="Mettez à jour les informations du poste."
      >
        {(close) => logic.editingOpportunity && (
          <OpportunityForm
            initialData={logic.editingOpportunity}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!logic.opportunityToDelete}
        onOpenChange={logic.handleCloseDeleteDialog}
        entityType="opportunité"
        entityLabel={logic.opportunityToDelete?.job_title || ''}
        onConfirm={logic.handleDelete}
        isDeleting={logic.isDeleting}
        error={logic.deleteError}
      />
    </PageLayout>
  );
}

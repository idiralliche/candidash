import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Briefcase,
} from 'lucide-react';

import { useOpportunities } from '@/hooks/use-opportunities';
import { useDeleteOpportunity } from '@/hooks/use-delete-opportunity';
import { useCompanies } from '@/hooks/use-companies';
import { Opportunity } from '@/api/model';
import { findEntityById } from '@/lib/utils';

import { Button } from '@/components/ui/button';

// Shared Components
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { EntitySheet } from '@/components/shared/entity-sheet';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';
import { FormDialog } from '@/components/shared/form-dialog';

// Feature Components
import { OpportunityForm } from '@/components/opportunities/opportunity-form';
import { OpportunityDetails } from '@/components/opportunities/opportunity-details';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';

export function OpportunitiesPage() {
  const { opportunities, isLoading } = useOpportunities();
  const { companies } = useCompanies();
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
    <div className="space-y-6 pt-20 h-[calc(100vh-2rem)] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Opportunités</h1>
        <FormDialog
          title="Nouvelle Opportunité"
          description="Ajoutez une nouvelle opportunité à votre pipeline."
          trigger={
            <Button variant="fab" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          }
        >
          {(close) => <OpportunityForm onSuccess={close} />}
        </FormDialog>
      </div>

      {/* CONTENT LIST */}
      <div className="flex-1 min-h-0 pb-8">
        {isLoading ? (
          <CardListSkeleton />
        ) : sortedOpportunities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Briefcase className="h-12 w-12 opacity-20" />
            <p>Aucune opportunité trouvée. Commencez par en ajouter une !</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
            {sortedOpportunities.map((opportunity) => {
              return (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  company={findEntityById(companies, opportunity.company_id)}
                  onClick={setSelectedOpportunity}
                  onEdit={setEditingOpportunity}
                  onDelete={setOpportunityToDelete}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!selectedOpportunity}
        onOpenChange={(open) => !open && setSelectedOpportunity(null)}
        title="Détails de l'opportunité"
      >
        {selectedOpportunity && (
          <OpportunityDetails
            opportunity={selectedOpportunity}
            company={findEntityById(companies, selectedOpportunity.company_id)}
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

      {/* EDIT DIALOG - Using FormDialog */}
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
    </div>
  );
}

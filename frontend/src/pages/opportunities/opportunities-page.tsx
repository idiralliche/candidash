import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, Briefcase } from 'lucide-react';

import { useOpportunities } from '@/hooks/use-opportunities';
import { useDeleteOpportunity } from '@/hooks/use-delete-opportunity';
import { useCompanies } from '@/hooks/use-companies';
import { Opportunity } from '@/api/model';
import { findEntityById } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Shared Components
import { EntitySheet } from '@/shared/components/entity-sheet';
import { EntityDeleteDialog } from '@/shared/components/entity-delete-dialog';
import { FormDialog } from '@/components/form-dialog';

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

  // Alphabetical sorting for list view (Default)
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
            <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-[#e84232] text-white shadow-lg shadow-primary/20">
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
          <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
            {Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="flex items-center gap-4 bg-[#16181d] border border-white/5 rounded-xl p-4">
                  {/* Square Icon */}
                  <Skeleton className="h-10 w-10 rounded-lg bg-white/10 shrink-0" />

                  {/* Title + Company */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                     <Skeleton className="h-5 w-56 bg-white/10" />
                     <Skeleton className="h-3 w-40 bg-white/5" />
                  </div>

                  {/* Badge + Location (Right) */}
                  <div className="flex items-center gap-6 pl-4">
                     <Skeleton className="h-6 w-24 rounded-full bg-white/5 hidden sm:block" />
                     <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
                  </div>
               </div>
            ))}
          </div>
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

      {/* --- DETAILS SHEET --- */}
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

      {/* --- EDIT DIALOG --- */}
      <Dialog open={!!editingOpportunity} onOpenChange={(open) => !open && setEditingOpportunity(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col bg-[#13151a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Modifier l'opportunité</DialogTitle>
            <DialogDescription className="text-gray-400">
              Mettez à jour les informations du poste.
            </DialogDescription>
          </DialogHeader>

          {editingOpportunity && (
            <OpportunityForm
              initialData={editingOpportunity}
              onSuccess={() => setEditingOpportunity(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --- DELETE ALERT --- */}
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

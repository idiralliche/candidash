import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, Target } from 'lucide-react';

import { useActions } from '@/hooks/use-actions';
import { useDeleteAction } from '@/hooks/use-delete-action';
import { Action } from '@/api/model';

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
import { ActionForm } from '@/components/actions/action-form';
import { ActionDetails } from '@/components/actions/action-details';
import { ActionCard } from '@/components/actions/action-card';

export function ActionsPage() {
  const { actions, isLoading } = useActions();
  const { mutate: deleteAction, isPending: isDeleting } = useDeleteAction();

  // State
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [actionToDelete, setActionToDelete] = useState<Action | null>(null);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // Sorting Logic: Actions à faire en premier (par date de création desc), puis actions terminées
  const sortedActions = useMemo(() => {
    if (!actions) return [];
    return [...actions].sort((a, b) => {
        // Si l'un est fini et l'autre non, le non-fini passe devant
        if (!!a.completed_date !== !!b.completed_date) {
            return a.completed_date ? 1 : -1;
        }
        // Sinon tri par date de création (plus récent en premier)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [actions]);

  const handleDelete = async () => {
    if (!actionToDelete) return;
    setDeleteError('');
    try {
      await deleteAction({ actionId: actionToDelete.id });
      toast.success('Action supprimée avec succès');
      setActionToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setDeleteError('Une erreur est survenue lors de la suppression.');
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Actions"
        action={
          <FormDialog
            title="Nouvelle Action"
            description="Planifiez une nouvelle action pour vos candidatures."
            trigger={
              <Fab>
                <Plus className="h-5 w-5" />
              </Fab>
            }
          >
            {(close) => <ActionForm onSuccess={close} />}
          </FormDialog>
        }
      />

      <PageContent>
        {isLoading ? (
          <CardListSkeleton />
        ) : sortedActions.length === 0 ? (
          <EmptyState
            icon={Target}
            message="Aucune action trouvée. Planifiez votre prochaine étape !"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {sortedActions.map(action => (
              <ActionCard
                key={action.id}
                action={action}
                onClick={setSelectedAction}
                onEdit={setEditingAction}
                onDelete={setActionToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!selectedAction}
        onOpenChange={(open) => !open && setSelectedAction(null)}
        title="Détail de l'action"
      >
        {selectedAction && (
          <ActionDetails
            action={selectedAction}
            onEdit={(a) => {
              setSelectedAction(null);
              setEditingAction(a);
            }}
            onDelete={(a) => {
              setSelectedAction(null);
              setActionToDelete(a);
            }}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!editingAction}
        onOpenChange={(open) => !open && setEditingAction(null)}
        title="Modifier l'action"
        description="Mettez à jour le statut ou les notes de l'action."
      >
        {(close) => editingAction && (
          <ActionForm
            initialData={editingAction}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!actionToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setActionToDelete(null);
            setDeleteError('');
          }
        }}
        entityType="action"
        entityLabel={actionToDelete?.type || ''}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </PageLayout>
  );
}

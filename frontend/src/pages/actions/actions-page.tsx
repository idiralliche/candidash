import {
  Plus,
  Target,
} from 'lucide-react';

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

// Logic Hook
import { useActionsPageLogic } from '@/hooks/actions/use-actions-page-logic';

export function ActionsPage() {
  const logic = useActionsPageLogic();

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
        {logic.isLoading ? (
          <CardListSkeleton />
        ) : logic.sortedActions.length === 0 ? (
          <EmptyState
            icon={Target}
            message="Aucune action trouvée. Planifiez votre prochaine étape !"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {logic.sortedActions.map(action => (
              <ActionCard
                key={action.id}
                action={action}
                onClick={logic.setSelectedAction}
                onEdit={logic.setEditingAction}
                onDelete={logic.setActionToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!logic.selectedAction}
        onOpenChange={(open) => !open && logic.setSelectedAction(null)}
        title="Détail de l'action"
      >
        {logic.selectedAction && (
          <ActionDetails
            action={logic.selectedAction}
            onEdit={logic.openEditFromDetails}
            onDelete={logic.openDeleteFromDetails}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!logic.editingAction}
        onOpenChange={(open) => !open && logic.setEditingAction(null)}
        title="Modifier l'action"
        description="Mettez à jour le statut ou les notes de l'action."
      >
        {(close) => logic.editingAction && (
          <ActionForm
            initialData={logic.editingAction}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!logic.actionToDelete}
        onOpenChange={logic.closeDeleteDialog}
        entityType="action"
        entityLabel={logic.actionToDelete?.type || ''}
        onConfirm={logic.handleDelete}
        isDeleting={logic.isDeleting}
        error={logic.deleteError}
      />
    </PageLayout>
  );
}

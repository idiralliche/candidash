import { useState } from 'react';
import { Plus, LucideIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Fab } from '@/components/ui/fab';
import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/shared/form-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';

interface WizardStepConfig<T, V, P> {
  title: string;
  entityName: string;
  entityNamePlural: string;
  icon: LucideIcon;
  emptyMessage: string;
  addButtonText: string;

  formComponent: React.ComponentType<{ onSuccess: (entity?: T) => void }>;

  deleteHook: () => {
    mutate: (variables: V, options?: { onSuccess?: () => void; onError?: () => void }) => void;
    isPending: boolean
  };
  getDeletePayload: (id: number) => V;
  getEntityLabel: (entity: T) => string;
  renderEntity: (entity: T, onDelete: (entity: T) => void, extraProps: P) => React.ReactNode;

  onSuccess: (entity: T) => void;
  onRemove: (id: number) => void;
  extraProps: P;
}

interface WizardStepGenericProps<T extends { id: number }, V, P> {
  entities: T[];
  config: WizardStepConfig<T, V, P>;
}

export function WizardStepGeneric<
  T extends { id: number },
  V = unknown,
  P = Record<string, never>
>({ entities, config }: WizardStepGenericProps<T, V, P>) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<T | null>(null);

  const { mutate: deleteEntity, isPending: isDeleting } = config.deleteHook();

  const handleSuccess = (closeDialog: () => void, newEntity?: T) => {
    if (newEntity) {
      config.onSuccess(newEntity);
      toast.success(`${config.entityName} ajouté avec succès`);
      closeDialog();
    }
  };

  const handleDelete = () => {
    if (!entityToDelete) return;

    const payload = config.getDeletePayload(entityToDelete.id);

    deleteEntity(payload, {
      onSuccess: () => {
        toast.success(`${config.entityName} supprimé`);
        config.onRemove(entityToDelete.id);
        setEntityToDelete(null);
      },
      onError: () => {
        toast.error(`Erreur lors de la suppression`);
      }
    });
  };

  const FormComponent = config.formComponent;
  const hasItems = entities.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">
          {config.entityNamePlural} ({entities.length})
        </h3>

        <FormDialog
          title={`Nouveau ${config.entityName}`}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          trigger={
            <Fab>
              <Plus className="h-5 w-5" />
            </Fab>
          }
        >
          {(close) => (
            <FormComponent onSuccess={(entity) => handleSuccess(close, entity)} />
          )}
        </FormDialog>
      </div>

      <div className="min-h-[200px]">
        {hasItems ? (
          <div className="flex flex-col gap-4">
            {entities.map((entity) =>
              config.renderEntity(entity, setEntityToDelete, config.extraProps)
            )}
          </div>
        ) : (
          <EmptyState
            icon={config.icon}
            message={config.emptyMessage}
            action={
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                {config.addButtonText}
              </Button>
            }
          />
        )}
      </div>

      <EntityDeleteDialog
        open={!!entityToDelete}
        onOpenChange={(open) => !open && setEntityToDelete(null)}
        entityType={config.entityName.toLowerCase()}
        entityLabel={entityToDelete ? config.getEntityLabel(entityToDelete) : ''}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        description={`Ce ${config.entityName.toLowerCase()} sera définitivement supprimé.`}
      />
    </div>
  );
}

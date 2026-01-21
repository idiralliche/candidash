import { Target } from 'lucide-react';
import { ActionForm } from '@/components/actions/action-form';
import { useDeleteAction } from '@/hooks/actions/use-delete-action';
import { WizardStepGeneric } from './wizard-step-generic';
import { Action } from '@/api/model';
import { ActionCard } from '@/components/actions/action-card';

interface WizardStepActionsProps {
  applicationId: number | null;
  actions: Action[];
  onActionAdded: (action: Action) => void;
  onActionRemoved: (actionId: number) => void;
}

export function WizardStepActions({
  applicationId,
  actions = [],
  onActionAdded,
  onActionRemoved
}: WizardStepActionsProps) {

  const ActionFormWrapper = ({ onSuccess }: { onSuccess: (entity?: Action) => void }) => (
    <ActionForm
      onSuccess={onSuccess}
      applicationId={applicationId}
    />
  );

  const renderAction = (
    action: Action,
    onDelete: (action: Action) => void,
  ) => (
    <ActionCard
      key={action.id}
      action={action}
      onDelete={() => onDelete(action)}
    />
  );

  const config = {
    title: "Actions",
    entityName: "Action",
    entityNamePlural: "Actions",
    icon: Target,
    emptyMessage: "Aucune action définie. Ajoutez des tâches à réaliser (relances, préparation...).",
    addButtonText: "Ajouter une action",

    formComponent: ActionFormWrapper,
    deleteHook: useDeleteAction,
    getDeletePayload: (id: number) => ({ actionId: id }),
    getEntityLabel: (action: Action) => action.type,

    renderEntity: renderAction,
    onSuccess: onActionAdded,
    onRemove: onActionRemoved,
    extraProps: {}
  };

  return (
    <WizardStepGeneric<Action, { actionId: number }>
      entities={actions}
      config={config}
    />
  );
}

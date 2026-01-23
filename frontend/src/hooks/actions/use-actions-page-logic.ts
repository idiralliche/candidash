import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { useActions } from '@/hooks/actions/use-actions';
import { useDeleteAction } from '@/hooks/actions/use-delete-action';
import { Action } from '@/api/model';

export function useActionsPageLogic() {
  const { actions, isLoading } = useActions();
  const { mutateAsync: deleteAction, isPending: isDeleting } = useDeleteAction();

  // --- STATE ---
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [actionToDelete, setActionToDelete] = useState<Action | null>(null);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // --- SORTING LOGIC ---
  const sortedActions = useMemo(() => {
    if (!actions) return [];
    return [...actions].sort((a, b) => {
      if (!!a.completed_date !== !!b.completed_date) {
        return a.completed_date ? 1 : -1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [actions]);

  // --- HANDLERS ---
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

  const closeDeleteDialog = (open: boolean) => {
    if (!open) {
      setActionToDelete(null);
      setDeleteError('');
    }
  };

  const openEditFromDetails = (action: Action) => {
    setSelectedAction(null);
    setEditingAction(action);
  };

  const openDeleteFromDetails = (action: Action) => {
    setSelectedAction(null);
    setActionToDelete(action);
  };

  return {
    // Data
    sortedActions,
    isLoading,

    // State
    selectedAction,
    setSelectedAction,
    actionToDelete,
    setActionToDelete,
    editingAction,
    setEditingAction,
    deleteError,
    isDeleting,

    // Handlers
    handleDelete,
    closeDeleteDialog,
    openEditFromDetails,
    openDeleteFromDetails,
  };
}

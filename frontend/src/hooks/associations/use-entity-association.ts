import { useState } from 'react';

/**
 * Interface for entities with an ID
 */
interface EntityWithId {
  id: number;
}

/**
 * Props for the use-entity-association hook
 */
interface UseEntityAssociationProps<T extends EntityWithId> {
  /** Association data */
  data: T[] | undefined;
  /** Loading state for data */
  isLoading: boolean;
  /** Delete function that returns a Promise */
  onDelete: (id: number) => Promise<void>;
  /** Deleting state */
  isDeleting: boolean;
}

/**
 * Generic hook to manage association state (CRUD)
 * Handles: create, edit, delete and their UI states
 */
export function useEntityAssociation<T extends EntityWithId>({
  data,
  isLoading,
  onDelete,
  isDeleting,
}: UseEntityAssociationProps<T>) {
  // Form states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  /**
   * Handles item deletion
   */
  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      await onDelete(deletingItem.id);
      setDeletingItem(null);
    } catch (error) {
      console.error("Error deleting item", error);
      throw error;
    }
  };

  /**
   * Resets all forms/dialogs
   */
  const resetForms = () => {
    setIsCreateOpen(false);
    setEditingItem(null);
    setDeletingItem(null);
  };

  return {
    // Data
    data,
    isLoading,
    isDeleting,

    // State
    isCreateOpen,
    editingItem,
    deletingItem,

    // Actions
    setIsCreateOpen,
    setEditingItem,
    setDeletingItem,
    handleDelete,
    resetForms,
  };
}

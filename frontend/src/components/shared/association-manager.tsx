import { ReactNode } from 'react';
import { LucideIcon, Plus } from 'lucide-react';

import { EntityDialog } from '@/components/shared/entity-dialog';
import { FormDialog } from '@/components/shared/form-dialog';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';
import { DetailsBlock } from '@/components/shared/details-block';
import { CardListSkeleton } from '@/components/shared/card-list-skeleton';
import { Button } from '@/components/ui/button';

/**
 * Interface for entities with ID
 */
interface EntityWithId {
  id: number;
}

/**
 * Props for AssociationManager
 */
interface AssociationManagerProps<T extends EntityWithId> {
  // ========== DISPLAY ==========
  /** Label displayed (e.g., "Contacts liés") */
  label: string;
  /** Icon to display */
  icon: LucideIcon;
  /** Message when there's no data */
  emptyMessage: string;

  // ========== DATA ==========
  /** List of items to display */
  items: T[] | undefined;
  /** Loading state */
  isLoading: boolean;

  // ========== RENDER ==========
  /**
   * Render function for each item
   * Receives the item + onEdit and onDelete callbacks
   */
  renderItem: (
    item: T,
    onEdit: (item: T) => void,
    onDelete: (item: T) => void
  ) => ReactNode;

  // ========== FORMS ==========
  /** Create form (render prop) */
  createForm: (close: () => void) => ReactNode;
  /** Edit form (render prop with item) */
  editForm: (item: T, close: () => void) => ReactNode;
  /** Create dialog title */
  createTitle: string;
  /** Create dialog description */
  createDescription?: string;
  /** Edit dialog title */
  editTitle: string;
  /** Edit dialog description */
  editDescription?: string;

  // ========== ACTIONS ==========
  /** Callback when create dialog opens/closes */
  onCreateOpen: (open: boolean) => void;
  /** Callback when editing an item */
  onEditItem: (item: T | null) => void;
  /** Callback when deleting an item */
  onDeleteItem: (item: T | null) => void;
  /** Delete confirmation callback */
  onConfirmDelete: () => Promise<void>;

  // ========== STATE ==========
  /** Create dialog open state */
  isCreateOpen: boolean;
  /** Item being edited */
  editingItem: T | null;
  /** Item being deleted */
  deletingItem: T | null;
  /** Deleting in progress state */
  isDeleting: boolean;

  // ========== CONTEXT ==========
  /** Display mode: dialog (card) or details (sheet) */
  mode: 'dialog' | 'details';
  /** Custom trigger for dialog (card mode only) */
  trigger?: ReactNode;

  // ========== DELETE LABELS ==========
  /** Entity type for delete dialog (e.g., "association") */
  deleteEntityType: string;
  /** Function to get the label of the entity to delete */
  getDeleteLabel: (item: T) => string;
  /** Custom description for delete dialog */
  deleteDescription?: ReactNode;
}

/**
 * Generic component to manage display and CRUD of associations
 * Supports 2 modes: 'dialog' (in a card) or 'details' (in a sheet)
 */
export function AssociationManager<T extends EntityWithId>({
  // Display
  label,
  icon: Icon,
  emptyMessage,

  // Data
  items,
  isLoading,

  // Render
  renderItem,

  // Forms
  createForm,
  editForm,
  createTitle,
  createDescription,
  editTitle,
  editDescription,

  // Actions
  onCreateOpen,
  onEditItem,
  onDeleteItem,
  onConfirmDelete,

  // State
  isCreateOpen,
  editingItem,
  deletingItem,
  isDeleting,

  // Context
  mode,
  trigger,

  // Delete labels
  deleteEntityType,
  getDeleteLabel,
  deleteDescription,
}: AssociationManagerProps<T>) {

  // Add button (shared between both modes)
  const addButton = (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 hover:bg-white-subtle rounded-full"
      onClick={(e) => {
        e.stopPropagation();
        onCreateOpen(true);
      }}
    >
      <Plus className="h-4 w-4" />
    </Button>
  );

  // List content (shared between both modes)
  const content = (
    <div className="space-y-3">
      {isLoading ? (
        <CardListSkeleton count={1} cardHeight="h-[60px]" />
      ) : !items?.length ? (
        <p className="rounded-md border px-4 py-2 text-sm text-muted-foreground italic text-center border-dashed border-white-subtle">
          {emptyMessage}
        </p>
      ) : (
        items.map(item => renderItem(item, onEditItem, onDeleteItem))
      )}
    </div>
  );

  // Render based on mode
  const display = mode === 'details' ? (
    // DETAILS MODE: Display in a DetailsBlock
    <DetailsBlock
      label={label}
      icon={Icon}
      action={addButton}
      variant="list"
    >
      {content}
    </DetailsBlock>
  ) : (
    // DIALOG MODE: Display in an EntityDialog
    <EntityDialog
      trigger={trigger}
      open={undefined}
      onOpenChange={undefined}
      title={
        <div className="flex items-center justify-between w-full">
          <span className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {label}
          </span>
          {addButton}
        </div>
      }
      onFormsOpen={(close) => {
        // Close dialog if a form is open
        if (isCreateOpen || editingItem || deletingItem) {
          close();
        }
      }}
    >
      {content}
    </EntityDialog>
  );

  return (
    <>
      {/* DISPLAY */}
      {display}

      {/* CREATE FORM DIALOG */}
      <FormDialog
        open={isCreateOpen}
        onOpenChange={onCreateOpen}
        title={createTitle}
        description={createDescription}
      >
        {(close) => createForm(close)}
      </FormDialog>

      {/* EDIT FORM DIALOG */}
      <FormDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && onEditItem(null)}
        title={editTitle}
        description={editDescription}
      >
        {(close) => editingItem && editForm(editingItem, close)}
      </FormDialog>

      {/* DELETE DIALOG */}
      <EntityDeleteDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && onDeleteItem(null)}
        entityType={deleteEntityType}
        entityLabel={deletingItem ? getDeleteLabel(deletingItem) : ''}
        onConfirm={onConfirmDelete}
        isDeleting={isDeleting}
        description={deleteDescription}
      />
    </>
  );
}

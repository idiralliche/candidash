import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { genderMap } from '@/lib/semantic-ui.ts';

interface EntityDeleteDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  /**
   * Callback when the dialog open state changes
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Entity type name for display (e.g., "entreprise", "contact", "opportunité", "événement")
   */
  entityType: string;
  /**
   * Entity label to display (e.g., company name, contact name)
   */
  entityLabel: string;
  /**
   * Callback when user confirms deletion
   */
  onConfirm: () => void;
  /**
   * Whether deletion is in progress
   */
  isDeleting: boolean;
  /**
   * Optional error message to display
   */
  error?: string;
  /**
   * Optional custom description to override default warning message.
   * Useful for cascading deletion warnings.
   */
  description?: ReactNode;
}

/**
 * Generic reusable delete confirmation dialog.
 * Replaces duplicated AlertDialog patterns across pages.
 */
export function EntityDeleteDialog({
  open,
  onOpenChange,
  entityType,
  entityLabel,
  onConfirm,
  isDeleting,
  error,
  description,
}: EntityDeleteDialogProps) {
  const { article, suffix, demonstrative } = genderMap[entityType] || { article: "Le ", suffix: "" };
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent className="bg-surface-base border-white-light text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Supprimer {demonstrative} {entityType} ?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            {description ? (
              description
            ) : (
              <>
                Cette action est irréversible. {article}{entityType}{" "}
                <span className="font-bold text-white">{entityLabel}</span>{" "}
                sera supprimé{suffix} définitivement.
              </>
            )}
          </AlertDialogDescription>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            aria-label={`Supprimer ${entityType} : ${entityLabel}`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" aria-label="Chargement..." />
                Suppression en cours...
              </>
            ) : (
              'Supprimer'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

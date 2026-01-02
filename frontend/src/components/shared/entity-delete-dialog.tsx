// frontend/src/components/shared/entity-delete-dialog.tsx
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
}

const genderMap: Record<string, { article: string; suffix: string; demonstrative: string }> = {
  événement: { article: "L'", suffix: "e", demonstrative: "cet" },
  entreprise: { article: "L'", suffix: "e", demonstrative: "cette" },
  opportunité: { article: "L'", suffix: "e", demonstrative: "cette" },
  contact: { article: "Le ", suffix: "", demonstrative: "ce" },
  document: { article: "Le ", suffix: "", demonstrative: "ce" },
};

/**
 * Generic reusable delete confirmation dialog.
 * Replaces duplicated AlertDialog patterns across pages.
 *
 * @example
 * ```
 * <EntityDeleteDialog
 *   open={!!companyToDelete}
 *   onOpenChange={(open) => !open && setCompanyToDelete(null)}
 *   entityType="entreprise"
 *   entityLabel={companyToDelete?.name || ''}
 *   onConfirm={handleDelete}
 *   isDeleting={isDeleting}
 * />
 * ```
 */
export function EntityDeleteDialog({
  open,
  onOpenChange,
  entityType,
  entityLabel,
  onConfirm,
  isDeleting,
  error,
}: EntityDeleteDialogProps) {
  const { article, suffix, demonstrative } = genderMap[entityType] || { article: "Le ", suffix: "" };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-surface-base border-white-light text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer {demonstrative} {entityType} ?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Cette action est irréversible. {article}{entityType}{" "}
            <span className="font-bold text-white">{entityLabel}</span>{" "}
            sera supprimé{suffix} définitivement.
          </AlertDialogDescription>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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

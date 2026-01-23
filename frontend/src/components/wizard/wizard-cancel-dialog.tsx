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

interface WizardCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function WizardCancelDialog({
  open,
  onOpenChange,
  onConfirm,
}: WizardCancelDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent className="bg-surface-base border-white-light text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Quitter l'assistant ?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
              <p>
                Vous êtes sur le point de quitter l'assistant de création.
              </p>
              <p className="font-medium text-warning">
                {"Note importante : Les données déjà enregistrées ne seront pas supprimées automatiquement."}
              </p>
              <p>
                {"Si vous souhaitez supprimer ces données, vous devrez le faire manuellement depuis leur page respective (opportunité, candidature, etc.)."}
              </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Continuer l'édition
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
          >
            Compris, quitter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

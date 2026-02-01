import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { genderMap } from '@/lib/semantic-ui.ts';

interface FormSubmitButtonProps {
  isPending: boolean;
  isEditing: boolean;
  entityType?: string;
  saveActionLabel?: string;
  editLabel?: ReactNode | string;
}

export function FormSubmitButton ({
  isPending,
  isEditing,
  entityType,
  saveActionLabel="Ajouter",
  editLabel="Enregistrer les modifications",
} : FormSubmitButtonProps) {
  const saveLabel = () => {
    if (!entityType) return saveActionLabel;
    const { article } = genderMap[entityType] || { article: "Le "};
    return `${saveActionLabel} ${article}${entityType}`;
  }

  return (
    <Button
      type="submit"
      variant="solid"
      palette="primary"
      className="w-full"
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditing ? "Enregistrement..." : "Ajout en cours..."}
        </>
      ) : (
        isEditing ? (editLabel) : saveLabel()
      )}
    </Button>
  )
}

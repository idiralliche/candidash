import { Control, FieldValues, Path } from 'react-hook-form';
import { FileText, Tag } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// Mise à jour de l'import vers votre nouveau SmartFormField
import { SmartFormField } from '@/components/ui/form-field-wrapper';

interface SharedDocumentFieldsProps<T extends FieldValues> {
  control: Control<T>;
}

export function SharedDocumentFields<T extends FieldValues>({ control }: SharedDocumentFieldsProps<T>) {
  return (
    <>
      <SmartFormField
        control={control}
        name={"name" as Path<T>}
        label="Nom *"
        component={Input}
        placeholder="Ex: CV 2024"
        leadingIcon={FileText}
      />
      <SmartFormField
        control={control}
        name={"type" as Path<T>}
        label="Type *"
        component={Input}
        placeholder="Ex: CV, Lettre, Portfolio..."
        leadingIcon={Tag}
      />
      <SmartFormField
        control={control}
        name={"description" as Path<T>}
        label="Description"
        component={Textarea}
        placeholder="Notes..."
        maxLength={5000}
        showCharCount
      />
    </>
  );
}

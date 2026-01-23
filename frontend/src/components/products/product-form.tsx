import { FormSubmitButton } from '@/components/shared/form-submit-button';
import { Form } from '@/components/ui/form';
import { ProductFormFields } from '@/components/products/product-form-fields';

import { Product } from '@/api/model';
import { useProductFormLogic } from '@/hooks/products/use-product-form-logic';

interface ProductFormProps {
  onSuccess?: (product?: Product) => void;
  className?: string;
  initialData?: Product;
}

export function ProductForm({ onSuccess, className, initialData }: ProductFormProps) {
  const logic = useProductFormLogic({ initialData, onSuccess });

  return (
    <Form {...logic.form}>
      <form
        onSubmit={logic.onSubmit}
        className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}
      >
        <ProductFormFields control={logic.form.control} />

        {logic.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de l'enregistrement.
          </div>
        )}

        <div className="sticky bottom-0">
          <FormSubmitButton
            isPending={logic.isPending}
            isEditing={logic.isEditing}
            entityType="produit"
          />
        </div>
      </form>
    </Form>
  );
}

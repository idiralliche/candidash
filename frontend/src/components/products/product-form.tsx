import { SmartForm } from '@/components/shared/smart-form';
import { ProductFormFields } from '@/components/products/product-form-fields';

import { Product } from '@/api/model';
import { useProductFormLogic } from '@/hooks/products/use-product-form-logic';

interface ProductFormProps {
  onSuccess?: (product?: Product) => void;
  className?: string;
  initialData?: Product;
  defaultOpportunityId?: number | null;
}

export function ProductForm({
  onSuccess,
  className,
  initialData,
  defaultOpportunityId
}: ProductFormProps) {

  const logic = useProductFormLogic({
    initialData,
    onSuccess,
    defaultOpportunityId
  });

  return (
  <SmartForm
    form={logic.form}
    onSubmit={logic.onSubmit}
    isPending={logic.isPending}
    className={className}
    error={logic.error}
    isEditing={logic.isEditing}
    entityType="produit"
  >
    <ProductFormFields
      control={logic.form.control}
      companies={logic.companies}
      isLoadingCompanies={logic.isLoadingCompanies}
      opportunities={logic.opportunities}
      isLoadingOpportunities={logic.isLoadingOpportunities}
    />
  </SmartForm>
  );
}

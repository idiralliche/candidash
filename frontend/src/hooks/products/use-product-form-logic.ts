import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useCreateProduct } from '@/hooks/products/use-create-product';
import { useUpdateProduct } from '@/hooks/products/use-update-product';
import { useCompanies } from '@/hooks/companies/use-companies';
import { useOpportunities } from '@/hooks/opportunities/use-opportunities';
import { useCreateOpportunityProduct } from '@/hooks/opportunity-products/use-create-opportunity-product';
import { useDeleteOpportunityProduct } from '@/hooks/opportunity-products/use-delete-opportunity-product';
import { useOpportunityProducts } from '@/hooks/opportunity-products/use-opportunity-products';
import { Product } from '@/api/model';

// --- Zod Schema ---

export const productSchema = z.object({
  name: z.string().min(1, "Le nom du produit est requis").max(255),
  company_id: z.string({ required_error: "L'entreprise est requise" }).min(1, "L'entreprise est requise"),
  description: z.string().max(5000).optional().or(z.literal('')),
  website: z.string().url("URL invalide").max(255).optional().or(z.literal('')),
  technologies_used: z.string().max(5000).optional().or(z.literal('')),
  opportunity_ids: z.array(z.string()).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface UseProductFormLogicProps {
  initialData?: Product;
  defaultOpportunityId?: number | null;
  onSuccess?: (product?: Product) => void;
}

export function useProductFormLogic({
  initialData,
  defaultOpportunityId,
  onSuccess
}: UseProductFormLogicProps) {

  // --- Mutations ---
  const {
    mutateAsync: createProduct,
    isPending: isCreating,
    error: createError
  } = useCreateProduct();

  const {
    mutateAsync: updateProduct,
    isPending: isUpdating,
    error: updateError
  } = useUpdateProduct();

  const { mutateAsync: createAssociation } = useCreateOpportunityProduct();
  const { mutateAsync: deleteAssociation } = useDeleteOpportunityProduct();

  // --- Data Fetching ---
  const { companies, isLoading: isLoadingCompanies } = useCompanies();
  const { opportunities, isLoading: isLoadingOpportunities } = useOpportunities({ limit: 100 });
  const { opportunityProducts: existingAssociations } = useOpportunityProducts({
    product_id: initialData?.id,
    limit: 100
  });

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  const initialCompanyId = initialData?.company_id ?? initialData?.company?.id;

  // --- Form Setup ---
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      company_id: initialCompanyId ? String(initialCompanyId) : '',
      description: initialData?.description || '',
      website: initialData?.website || '',
      technologies_used: initialData?.technologies_used || '',
      opportunity_ids: defaultOpportunityId ? [String(defaultOpportunityId)] : [],
    },
  });

  // --- Effects ---

  // Reset & Hydration
  useEffect(() => {
    if (initialData) {
      const companyId = initialData.company_id ?? initialData.company?.id;

      const dbLinkedIds = existingAssociations?.map(op => String(op.opportunity_id)) || [];

      // Merge DB associations + Context (without duplicates)
      const finalIds = new Set(dbLinkedIds);
      if (defaultOpportunityId) finalIds.add(String(defaultOpportunityId));

      form.reset({
        name: initialData.name,
        company_id: companyId ? String(companyId) : '',
        description: initialData.description || '',
        website: initialData.website || '',
        technologies_used: initialData.technologies_used || '',
        opportunity_ids: Array.from(finalIds),
      });
    } else if (defaultOpportunityId) {
      const currentIds = form.getValues('opportunity_ids') || [];
      if (!currentIds.includes(String(defaultOpportunityId))) {
        form.setValue('opportunity_ids', [...currentIds, String(defaultOpportunityId)]);
      }
    }
  }, [initialData, form, existingAssociations, defaultOpportunityId]);


  // --- Submit ---
  async function onSubmit(values: ProductFormValues) {
    const companyId = parseInt(values.company_id);
    const payload = {
      name: values.name,
      company_id: companyId,
      description: values.description || null,
      website: values.website || null,
      technologies_used: values.technologies_used || null,
    };

    try {
      let resultProduct: Product | undefined;
      let productId: number;

      if (isEditing && initialData) {
        const result = await updateProduct({ productId: initialData.id, data: payload });
        resultProduct = result as unknown as Product;
        productId = initialData.id;
      } else {
        const result = await createProduct({ data: payload });
        resultProduct = result;
        productId = result.id;
      }

      // Association Logic
      const selectedIds = values.opportunity_ids?.map(id => parseInt(id)) || [];

      if (isEditing && existingAssociations) {
        const currentIds = existingAssociations.map(op => op.opportunity_id);
        const toAdd = selectedIds.filter(id => !currentIds.includes(id));
        const toDelete = existingAssociations.filter(op => !selectedIds.includes(op.opportunity_id));

        await Promise.all([
          ...toAdd.map(oppId => createAssociation({ data: { opportunity_id: oppId, product_id: productId } })),
          ...toDelete.map(assoc => deleteAssociation({ associationId: assoc.id }))
        ]);
      } else {
        if (selectedIds.length > 0) {
          await Promise.all(
            selectedIds.map(oppId => createAssociation({ data: { opportunity_id: oppId, product_id: productId } }))
          );
        }
      }

      form.reset();
      if (onSuccess) onSuccess(resultProduct);

    } catch (err) {
      console.error("Error submitting product form", err);
    }
  }

  return {
    form,
    onSubmit: onSubmit,
    companies,
    isLoadingCompanies,
    opportunities,
    isLoadingOpportunities,
    isEditing,
    isPending,
    error,
  };
}

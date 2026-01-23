import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useCreateProduct } from '@/hooks/products/use-create-product';
import { useUpdateProduct } from '@/hooks/products/use-update-product';
import { useCompanies } from '@/hooks/companies/use-companies';
import { Product } from '@/api/model';

// --- Zod Schema ---

export const productSchema = z.object({
  name: z.string().min(1, "Le nom du produit est requis").max(255),
  company_id: z.string({ required_error: "L'entreprise est requise" }).min(1, "L'entreprise est requise"),
  description: z.string().max(5000).optional().or(z.literal('')),
  website: z.string().url("URL invalide").max(255).optional().or(z.literal('')),
  technologies_used: z.string().max(5000).optional().or(z.literal('')),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface UseProductFormLogicProps {
  initialData?: Product;
  onSuccess?: (product?: Product) => void;
}

export function useProductFormLogic({ initialData, onSuccess }: UseProductFormLogicProps) {
  // --- Mutations & Data Fetching ---
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

  const { companies, isLoading: isLoadingCompanies } = useCompanies();

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
    },
  });

  // --- Effects ---

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      const companyId = initialData.company_id ?? initialData.company?.id;

      form.reset({
        name: initialData.name,
        company_id: companyId ? String(companyId) : '',
        description: initialData.description || '',
        website: initialData.website || '',
        technologies_used: initialData.technologies_used || '',
      });
    }
  }, [initialData, form]);

  // --- Submit Handler ---
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

      if (isEditing && initialData) {
        const result = await updateProduct({ productId: initialData.id, data: payload });
        resultProduct = result as unknown as Product;
      } else {
        resultProduct = await createProduct({ data: payload });
      }

      form.reset();
      if (onSuccess) onSuccess(resultProduct);

    } catch (err) {
      console.error("Error submitting product form", err);
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    companies,
    isLoadingCompanies,
    isEditing,
    isPending,
    error,
  };
}

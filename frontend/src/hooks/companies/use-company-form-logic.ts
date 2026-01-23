import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useCompanies } from '@/hooks/companies/use-companies';
import { useCreateCompany } from '@/hooks/companies/use-create-company';
import { useUpdateCompany } from '@/hooks/companies/use-update-company';
import { Company } from '@/api/model';

// Validation Schema
export const companySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(255, "Maximum 255 caractères"),
  siret: z.string().max(14).refine((val) => !val || /^\d{14}$/.test(val), {
    message: "Le SIRET doit contenir exactement 14 chiffres",
  }).optional(),
  website: z.string().max(255).url({ message: "URL invalide" }).optional().or(z.literal('')),
  headquarters: z.string().max(500).optional(),
  is_intermediary: z.boolean().default(false),
  company_type: z.string().max(100).refine((val) => !val || val.length >= 2, { message: "Min 2 caractères" }).optional(),
  industry: z.string().max(100).refine((val) => !val || val.length >= 2, { message: "Min 2 caractères" }).optional(),
  notes: z.string().max(50000).optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

interface UseCompanyFormLogicProps {
  initialData?: Company;
  onSuccess?: (company?: Company) => void;
}

export function useCompanyFormLogic({ initialData, onSuccess }: UseCompanyFormLogicProps) {
  // Data & Mutations
  const { companies } = useCompanies();
  const { mutateAsync: createCompany, isPending: isCreating, error: createError } = useCreateCompany();
  const { mutateAsync: updateCompany, isPending: isUpdating, error: updateError } = useUpdateCompany();

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  // Form Setup
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      siret: initialData?.siret || '',
      website: initialData?.website || '',
      headquarters: initialData?.headquarters || '',
      is_intermediary: initialData?.is_intermediary || false,
      company_type: initialData?.company_type || '',
      industry: initialData?.industry || '',
      notes: initialData?.notes || '',
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        siret: initialData.siret || '',
        website: initialData.website || '',
        headquarters: initialData.headquarters || '',
        is_intermediary: initialData.is_intermediary,
        company_type: initialData.company_type || '',
        industry: initialData.industry || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, form]);

  // Submit Handler
  async function onSubmit(values: CompanyFormValues) {
    // Duplicate Check (SIRET)
    if (values.siret && companies) {
      const duplicate = companies.find(c => c.siret === values.siret && c.id !== initialData?.id);
      if (duplicate) {
        form.setError("siret", {
          type: "manual",
          message: `Ce SIRET est déjà utilisé par "${duplicate.name}".`
        });
        return;
      }
    }

    const payload = {
      name: values.name,
      siret: values.siret || null,
      website: values.website || null,
      headquarters: values.headquarters || null,
      is_intermediary: values.is_intermediary,
      company_type: values.company_type || null,
      industry: values.industry || null,
      notes: values.notes || null,
    };

    try {
      let resultCompany: Company | undefined;

      if (isEditing && initialData) {
        const result = await updateCompany({ companyId: initialData.id, data: payload });
        resultCompany = result as unknown as Company;
      } else {
        resultCompany = await createCompany({ data: payload });
      }

      form.reset();
      if (onSuccess) onSuccess(resultCompany);

    } catch (err) {
      console.error("Error submitting company form", err);
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isEditing,
    isPending,
    error,
  };
}

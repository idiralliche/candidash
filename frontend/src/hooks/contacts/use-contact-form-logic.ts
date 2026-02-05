import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useCreateContact } from '@/hooks/contacts/use-create-contact';
import { useUpdateContact } from '@/hooks/contacts/use-update-contact';
import { useCompanies } from '@/hooks/companies/use-companies';
import { Contact } from '@/api/model';

// Regex LinkedIn
const LINKEDIN_PATTERN = /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/([a-zA-Z0-9-]+)\/?$|^(?:in|company)\/([a-zA-Z0-9-]+)$/;

// Schema
export const contactSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis").max(100),
  last_name: z.string().min(1, "Le nom est requis").max(100),
  position: z.string().max(100).optional(),
  email: z.string().email("Email invalide").max(255).optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  linkedin: z.string().regex(LINKEDIN_PATTERN, "Format invalide (URL ou in/user)").optional().or(z.literal('')),
  company_id: z.string().optional(),
  is_independent_recruiter: z.boolean().default(false),
  relationship_notes: z.string().max(50000).optional(),
  notes: z.string().max(50000).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

interface UseContactFormLogicProps {
  initialData?: Contact;
  onSuccess?: (contact?: Contact) => void;
}

export function useContactFormLogic({ initialData, onSuccess }: UseContactFormLogicProps) {
  // Mutations
  const { mutateAsync: createContact, isPending: isCreating, error: createError } = useCreateContact();
  const { mutateAsync: updateContact, isPending: isUpdating, error: updateError } = useUpdateContact();

  // Data Fetching
  const { companies, isLoading: isLoadingCompanies } = useCompanies();

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  const initialCompanyId = initialData?.company_id ?? initialData?.company?.id;

  // Form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      position: initialData?.position || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      linkedin: initialData?.linkedin || '',
      company_id: initialCompanyId ? String(initialCompanyId) : undefined,
      is_independent_recruiter: initialData?.is_independent_recruiter || false,
      relationship_notes: initialData?.relationship_notes || '',
      notes: initialData?.notes || '',
    },
  });

  // Reset effect
  useEffect(() => {
    if (initialData) {
      const companyId = initialData.company_id ?? initialData.company?.id;

      form.reset({
        first_name: initialData.first_name,
        last_name: initialData.last_name,
        position: initialData.position || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        linkedin: initialData.linkedin || '',
        company_id: companyId ? String(companyId) : undefined,
        is_independent_recruiter: initialData.is_independent_recruiter,
        relationship_notes: initialData.relationship_notes || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, form]);

  // Submit
  async function onSubmit(values: ContactFormValues) {
    const companyId = values.company_id ? parseInt(values.company_id) : undefined;
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      company_id: companyId,
      is_independent_recruiter: values.is_independent_recruiter,
      position: values.position || null,
      email: values.email || null,
      phone: values.phone || null,
      linkedin: values.linkedin || null,
      relationship_notes: values.relationship_notes || null,
      notes: values.notes || null,
    };

    try {
      let resultContact: Contact | undefined;

      if (isEditing && initialData) {
        const result = await updateContact({ contactId: initialData.id, data: payload });
        resultContact = result as unknown as Contact;
      } else {
        resultContact = await createContact({ data: payload });
      }

      form.reset();
      if (onSuccess) onSuccess(resultContact);
    } catch (err) {
      console.error("Erreur lors de la soumission du contact", err);
    }
  }

  return {
    form,
    onSubmit,
    companies,
    isLoadingCompanies,
    isEditing,
    isPending,
    error,
  };
}

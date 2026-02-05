import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useCreateOpportunityContact } from '@/hooks/opportunity-contacts/use-create-opportunity-contact';
import { useUpdateOpportunityContact } from '@/hooks/opportunity-contacts/use-update-opportunity-contact';
import { OpportunityContact } from '@/api/model';

// Schema
export const opportunityContactSchema = z.object({
  opportunity_id: z.coerce.number().min(1, "L'opportunité est requise"),
  contact_id: z.coerce.number().min(1, "Le contact est requis"),
  is_primary_contact: z.boolean().default(false),
  contact_role: z.string().max(50).optional().or(z.literal('')),
  origin: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(5000).optional().or(z.literal('')),
});

export type OpportunityContactFormValues = z.infer<typeof opportunityContactSchema>;

interface UseOpportunityContactFormLogicProps {
  initialData?: OpportunityContact;
  preselectedOpportunityId?: number;
  preselectedContactId?: number;
  onSuccess?: (data?: OpportunityContact) => void;
}

export function useOpportunityContactFormLogic({
  initialData,
  preselectedOpportunityId,
  preselectedContactId,
  onSuccess
}: UseOpportunityContactFormLogicProps) {
  // Mutations
  const {
    mutateAsync: createAssoc,
    isPending: isCreating,
    error: createError
  } = useCreateOpportunityContact();
  const {
    mutateAsync: updateAssoc,
    isPending: isUpdating,
    error: updateError
  } = useUpdateOpportunityContact();

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  // Form initialization
  const form = useForm<OpportunityContactFormValues>({
    resolver: zodResolver(opportunityContactSchema),
    defaultValues: {
      opportunity_id: initialData?.opportunity_id ?? preselectedOpportunityId ?? 0,
      contact_id: initialData?.contact_id ?? preselectedContactId ?? 0,
      is_primary_contact: initialData?.is_primary_contact ?? false,
      contact_role: initialData?.contact_role ?? '',
      origin: initialData?.origin ?? '',
      notes: initialData?.notes ?? '',
    },
  });

  // Reset effect to handle async initialData loading
  useEffect(() => {
    if (initialData) {
      form.reset({
        opportunity_id: initialData.opportunity_id,
        contact_id: initialData.contact_id,
        is_primary_contact: initialData.is_primary_contact,
        contact_role: initialData.contact_role || '',
        origin: initialData.origin || '',
        notes: initialData.notes || '',
      });
    } else {
      // Ensure preselected IDs are set when opening create modal multiple times
      if (preselectedOpportunityId) form.setValue('opportunity_id', preselectedOpportunityId);
      if (preselectedContactId) form.setValue('contact_id', preselectedContactId);
    }
  }, [initialData, preselectedOpportunityId, preselectedContactId, form]);

  // Submit handler
  async function onSubmit(values: OpportunityContactFormValues) {
    try {
      let resultAssoc: OpportunityContact | undefined;

      if (isEditing && initialData) {
        // UPDATE: Do NOT send IDs (immutable), only metadata
        const payload = {
          is_primary_contact: values.is_primary_contact,
          contact_role: values.contact_role || null,
          origin: values.origin || null,
          notes: values.notes || null,
        };

        const result = await updateAssoc({
          associationId: initialData.id,
          data: payload
        });
        resultAssoc = result as unknown as OpportunityContact;

      } else {
        // CREATE: Send everything including FKs
        const payload = {
          opportunity_id: values.opportunity_id,
          contact_id: values.contact_id,
          is_primary_contact: values.is_primary_contact,
          contact_role: values.contact_role || null,
          origin: values.origin || null,
          notes: values.notes || null,
        };

        resultAssoc = await createAssoc({ data: payload });
      }

      form.reset();
      if (onSuccess) onSuccess(resultAssoc);
    } catch (err) {
      console.error("Error submitting opportunity contact association", err);
    }
  }

  return {
    form,
    onSubmit,
    isEditing,
    isPending,
    error,
  };
}

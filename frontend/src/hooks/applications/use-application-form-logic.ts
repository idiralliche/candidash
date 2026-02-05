import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useCreateApplication } from '@/hooks/applications/use-create-application';
import { useUpdateApplication } from '@/hooks/applications/use-update-application';
import { Application, ApplicationStatus } from '@/api/model';

// --- Zod Schema ---

const applicationSchema = z.object({
  opportunity_id: z.string({ required_error: "L'opportunité est requise" }).min(1, "L'opportunité est requise"),
  application_date: z.date({ required_error: "La date est requise" }),
  status: z.nativeEnum(ApplicationStatus).optional(),
  salary_expectation: z.coerce.number().optional().or(z.literal('')),
  resume_used_id: z.string().optional().or(z.literal('')),
  cover_letter_id: z.string().optional().or(z.literal('')),
  is_archived: z.boolean().default(false),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface UseApplicationFormLogicProps {
  initialData?: Application;
  onSuccess?: () => void;
}

export function useApplicationFormLogic({ initialData, onSuccess }: UseApplicationFormLogicProps) {
  // --- Mutations ---
  const {
    mutate: createApplication,
    isPending: isCreating,
    error: createError
  } = useCreateApplication();

  const {
    mutate: updateApplication,
    isPending: isUpdating,
    error: updateError
  } = useUpdateApplication();

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  // --- Initial Data Preparation ---
  const initialResumeId = initialData?.resume_used_id ?? initialData?.resume_used?.id;
  const initialCoverLetterId = initialData?.cover_letter_id ?? initialData?.cover_letter?.id;

  // --- Form Setup ---
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      opportunity_id: initialData?.opportunity_id ? String(initialData.opportunity_id) : '',
      application_date: initialData?.application_date ? new Date(initialData.application_date) : new Date(),
      status: initialData?.status || ApplicationStatus.pending,
      salary_expectation: initialData?.salary_expectation || '',
      resume_used_id: initialResumeId ? String(initialResumeId) : '',
      cover_letter_id: initialCoverLetterId ? String(initialCoverLetterId) : '',
      is_archived: initialData?.is_archived || false,
    },
  });

  // --- Effects ---

  // Reset form when initialData changes (for editing mode)
  useEffect(() => {
    if (initialData) {
      const resumeId = initialData.resume_used_id ?? initialData.resume_used?.id;
      const coverId = initialData.cover_letter_id ?? initialData.cover_letter?.id;

      form.reset({
        opportunity_id: String(initialData.opportunity_id),
        application_date: new Date(initialData.application_date),
        status: initialData.status,
        salary_expectation: initialData.salary_expectation || '',
        resume_used_id: resumeId ? String(resumeId) : '',
        cover_letter_id: coverId ? String(coverId) : '',
        is_archived: initialData.is_archived,
      });
    }
  }, [initialData, form]);

  // --- Submit Handler ---
  function onSubmit(values: ApplicationFormValues) {
    // Helper to handle empty strings as null
    const parseId = (val?: string | null) => (val && val.trim() !== "") ? parseInt(val) : null;

    const payload = {
      opportunity_id: parseInt(values.opportunity_id),
      // API expects "YYYY-MM-DD" string for Date type
      application_date: values.application_date.toISOString().split('T')[0],
      status: values.status,
      salary_expectation: values.salary_expectation ? Number(values.salary_expectation) : null,
      resume_used_id: parseId(values.resume_used_id),
      cover_letter_id: parseId(values.cover_letter_id),
      is_archived: values.is_archived,
    };

    const options = {
      onSuccess: () => {
        form.reset();
        if (onSuccess) onSuccess();
      },
    };

    if (isEditing && initialData) {
      updateApplication({ applicationId: initialData.id, data: payload }, options);
    } else {
      createApplication({ data: payload }, options);
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

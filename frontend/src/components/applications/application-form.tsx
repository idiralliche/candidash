import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

import { useCreateApplication } from '@/hooks/applications/use-create-application';
import { useUpdateApplication } from '@/hooks/applications/use-update-application';
import {
  Application,
  ApplicationStatus,
} from '@/api/model';
import { ApplicationFormFields } from '@/components/applications/application-form-fields';

// Zod Schema
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

interface ApplicationFormProps {
  onSuccess?: () => void;
  className?: string;
  initialData?: Application;
}

export function ApplicationForm({
  onSuccess,
  className,
  initialData,
}: ApplicationFormProps) {
  // Hooks
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

  // Prepare initial IDs from nested objects if necessary
  const initialResumeId = initialData?.resume_used_id ?? initialData?.resume_used?.id;
  const initialCoverLetterId = initialData?.cover_letter_id ?? initialData?.cover_letter?.id;

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}
      >

        <ApplicationFormFields
          control={form.control}
          hideOpportunitySelect={false}
          hideArchiveSwitch={!isEditing}
        />

        {/* ERROR MESSAGE */}
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Une erreur est survenue lors de l'enregistrement.
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="sticky bottom-0">
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
                {isEditing ? "Enregistrement..." : "Création..."}
              </>
            ) : (
              isEditing ? "Enregistrer les modifications" : "Ajouter la candidature"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

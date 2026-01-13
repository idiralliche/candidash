import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Banknote,
  FileText,
  Mail
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormSwitch } from '@/components/ui/form-switch';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreateApplication } from '@/hooks/use-create-application';
import { useUpdateApplication } from '@/hooks/use-update-application';
import { useOpportunities } from '@/hooks/use-opportunities';
import { useDocuments } from '@/hooks/use-documents';
import { Application, ApplicationStatus } from '@/api/model';
import { LABELS_APPLICATION_STATUS, getLabel } from '@/lib/dictionaries';

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

export function ApplicationForm({ onSuccess, className, initialData }: ApplicationFormProps) {
  // Hooks
  const { mutate: createApplication, isPending: isCreating, error: createError } = useCreateApplication();
  const { mutate: updateApplication, isPending: isUpdating, error: updateError } = useUpdateApplication();

  // Data Loaders
  const { opportunities, isLoading: isLoadingOpportunities } = useOpportunities();
  const { documents, isLoading: isLoadingDocuments } = useDocuments();

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
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}>

        {/* --- CONTEXT (Opportunity) --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Contexte</h3>

          <SmartFormField
            control={form.control}
            name="opportunity_id"
            label="Opportunité *"
            description="Le poste auquel vous postulez."
          >
            {(field) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingOpportunities}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une opportunité" />
                </SelectTrigger>
                <SelectContent>
                  {opportunities?.map(op => (
                    <SelectItem key={op.id} value={op.id.toString()}>
                      {op.job_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </SmartFormField>
        </div>

        {/* --- DETAILS --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Détails</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Date Picker */}
            <SmartFormField
              control={form.control}
              name="application_date"
              label="Date de candidature *"
            >
              {(field) => (
                <DatePicker
                  date={field.value}
                  onSelect={field.onChange}
                  disabled={false}
                />
              )}
            </SmartFormField>

            {/* Status Select */}
            <SmartFormField
              control={form.control}
              name="status"
              label="Statut *"
            >
              {(field) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ApplicationStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {getLabel(LABELS_APPLICATION_STATUS, status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </SmartFormField>
          </div>

          <SmartFormField
            control={form.control}
            name="salary_expectation"
            label="Prétentions Salariales (€)"
            component={Input}
            type="number"
            placeholder="Ex: 45000"
            leadingIcon={Banknote}
          />
        </div>

        {/* --- DOCUMENTS --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Documents</h3>

          {/* Resume Select with Clear Button */}
          <SmartFormField
            control={form.control}
            name="resume_used_id"
            label="CV utilisé"
          >
            {(field) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingDocuments}>
                <SelectTrigger
                  className="w-full"
                  onClear={field.value ? () => field.onChange("") : undefined}
                >
                   <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="Sélectionner un CV" />
                   </div>
                </SelectTrigger>
                <SelectContent>
                  {documents?.map(doc => (
                    <SelectItem key={doc.id} value={doc.id.toString()}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </SmartFormField>

          {/* Cover Letter Select with Clear Button */}
          <SmartFormField
            control={form.control}
            name="cover_letter_id"
            label="Lettre de motivation"
          >
            {(field) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingDocuments}>
                <SelectTrigger
                  className="w-full"
                  onClear={field.value ? () => field.onChange("") : undefined}
                >
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="Sélectionner une lettre" />
                   </div>
                </SelectTrigger>
                <SelectContent>
                  {documents?.map(doc => (
                    <SelectItem key={doc.id} value={doc.id.toString()}>
                      {doc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </SmartFormField>
        </div>

        {/* --- OPTIONS --- */}
        {isEditing && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Archiver</h3>
            <SmartFormField
              control={form.control}
              name="is_archived"
            >
              {(field) => (
                <FormSwitch
                  {...field}
                  label="Archiver cette candidature"
                  description="Masque la candidature des listes par défaut."
                />
              )}
            </SmartFormField>
          </div>
        )}

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

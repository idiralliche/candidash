import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

import { useCreateOpportunity } from '@/hooks/opportunities/use-create-opportunity';
import { useUpdateOpportunity } from '@/hooks/opportunities/use-update-opportunity';
import { Opportunity } from '@/api/model';
import { OpportunityFormFields} from '@/components/opportunities/opportunity-form-fields';

const opportunitySchema = z.object({
  // Required
  job_title: z.string()
    .min(2, "Le titre doit faire au moins 2 caractères")
    .max(255, "Le titre est trop long (max 255)"),

  application_type: z.enum(["job_posting", "spontaneous", "reached_out"], {
    required_error: "Le type de candidature est requis",
  }),

  // company_id is optional in schema, mapped manually in onSubmit
  company_id: z.string().optional(),
  position_type: z.string()
    .max(100, "Max 100 caractères")
    .refine(val => !val || val.length >= 2, "Doit faire au moins 2 caractères")
    .optional(),
  source: z.string()
    .max(100, "Max 100 caractères")
    .refine(val => !val || val.length >= 2, "Doit faire au moins 2 caractères")
    .optional(),
  contract_type: z.enum(["permanent", "fixed_term", "freelance", "contractor", "internship", "apprenticeship"]).optional(),
  location: z.string().max(500, "Max 500 caractères").optional(),
  remote_policy: z.enum(["on_site", "full_remote", "hybrid", "flexible"]).optional(),
  remote_details: z.string().max(5000, "Max 5000 caractères").optional(),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  salary_info: z.string().max(2000, "Max 2000 caractères").optional(),
  required_skills: z.string().max(5000, "Max 5000 caractères").optional(),
  technologies: z.string().max(5000, "Max 5000 caractères").optional(),
  job_posting_url: z.string().max(255).url("URL invalide").optional().or(z.literal('')),
  job_description: z.string().max(5000, "Max 5000 caractères").optional(),
  recruitment_process: z.string().max(10000, "Max 10000 caractères").optional(),

}).refine((data) => {
  // salary_max >= salary_min
  if (data.salary_min && data.salary_max) {
    const min = parseFloat(data.salary_min);
    const max = parseFloat(data.salary_max);
    if (!isNaN(min) && !isNaN(max) && max < min) {
      return false;
    }
  }
  return true;
}, {
  message: "Le salaire maximum doit être supérieur au minimum",
  path: ["salary_max"],
});

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

interface OpportunityFormProps {
  onSuccess?: () => void;
  className?: string;
  initialData?: Opportunity;
}

export function OpportunityForm({
  onSuccess,
  className,
  initialData
}: OpportunityFormProps) {
  const { mutate: createOpportunity, isPending: isCreating, error } = useCreateOpportunity();
  const { mutate: updateOpportunity, isPending: isUpdating } = useUpdateOpportunity();

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;

  const initialCompanyId = initialData?.company_id ?? initialData?.company?.id;

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      job_title: initialData?.job_title || '',
      application_type: initialData?.application_type || 'job_posting',
      company_id: initialCompanyId ? initialCompanyId.toString() : undefined,
      position_type: initialData?.position_type || '',
      source: initialData?.source || '',
      contract_type: initialData?.contract_type || undefined,
      location: initialData?.location || '',
      remote_policy: initialData?.remote_policy || undefined,
      remote_details: initialData?.remote_details || '',
      salary_min: initialData?.salary_min ? initialData.salary_min.toString() : '',
      salary_max: initialData?.salary_max ? initialData.salary_max.toString() : '',
      salary_info: initialData?.salary_info || '',
      required_skills: initialData?.required_skills || '',
      technologies: initialData?.technologies || '',
      job_posting_url: initialData?.job_posting_url || '',
      job_description: initialData?.job_description || '',
      recruitment_process: initialData?.recruitment_process || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      const initialCompanyId = initialData.company_id ?? initialData.company?.id;

      form.reset({
        job_title: initialData.job_title,
        application_type: initialData.application_type,
        company_id: initialCompanyId?.toString(),
        position_type: initialData.position_type || '',
        source: initialData.source || '',
        contract_type: initialData.contract_type || undefined,
        location: initialData.location || '',
        remote_policy: initialData.remote_policy || undefined,
        remote_details: initialData.remote_details || '',
        salary_min: initialData.salary_min?.toString() || '',
        salary_max: initialData.salary_max?.toString() || '',
        salary_info: initialData.salary_info || '',
        required_skills: initialData.required_skills || '',
        technologies: initialData.technologies || '',
        job_posting_url: initialData.job_posting_url || '',
        job_description: initialData.job_description || '',
        recruitment_process: initialData.recruitment_process || '',
      });
    }
  }, [initialData, form]);

  function onSubmit(values: OpportunityFormValues) {
    const companyId = values.company_id ? parseInt(values.company_id) : undefined;
    const salaryMin = values.salary_min ? parseFloat(values.salary_min) : undefined;
    const salaryMax = values.salary_max ? parseFloat(values.salary_max) : undefined;

    const payload = {
      // Required
      job_title: values.job_title,
      application_type: values.application_type,
      // Optional
      company_id: companyId,
      position_type: values.position_type || null,
      source: values.source || null,
      contract_type: values.contract_type || null,
      location: values.location || null,
      remote_policy: values.remote_policy || null,
      remote_details: values.remote_details || null,
      salary_min: salaryMin,
      salary_max: salaryMax,
      salary_info: values.salary_info || null,
      required_skills: values.required_skills || null,
      technologies: values.technologies || null,
      job_posting_url: values.job_posting_url || null,
      job_description: values.job_description || null,
      recruitment_process: values.recruitment_process || null,
    };

    const options = {
      onSuccess: () => {
        form.reset();
        if (onSuccess) onSuccess();
      }
    };

    if (isEditing && initialData) {
      updateOpportunity({ opportunityId: initialData.id, data: payload }, options);
    } else {
      createOpportunity({ data: payload }, options);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}
      >

        <OpportunityFormFields control={form.control} />

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de la création de l'opportunité.
          </div>
        )}

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
                {isEditing ? "Enregistrement..." : "Ajout en cours..."}
              </>
            ) : (
              isEditing ? "Enregistrer les modifications" : "Ajouter l'opportunité"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

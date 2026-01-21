import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useWizardInitMutation } from '@/hooks/wizard/use-wizard-init-mutation';
import {
  OpportunityFormFields,
  OpportunityFormData,
} from '@/components/opportunities/opportunity-form-fields';
import {
  ApplicationFormFields,
  ApplicationFormData,
} from '@/components/applications/application-form-fields';
import { ApplicationStatus } from '@/api/model';

// combined type
type WizardInitFormValues = OpportunityFormData & Omit<ApplicationFormData, 'opportunity_id'>;

// combined schema
const wizardInitSchema = z.object({
  // Opportunity fields
  job_title: z.string().min(2, "Min 2 caractères").max(255, "Max 255 caractères"),
  application_type: z.enum(["job_posting", "spontaneous", "reached_out"], {
    required_error: "Type de candidature requis",
  }),
  company_id: z.string().optional(),
  position_type: z.string().max(100).optional(),
  source: z.string().max(100).optional(),
  contract_type: z.enum(["permanent", "fixed_term", "freelance", "contractor", "internship", "apprenticeship"]).optional(),
  location: z.string().max(500).optional(),
  remote_policy: z.enum(["on_site", "full_remote", "hybrid", "flexible"]).optional(),
  remote_details: z.string().max(5000).optional(),
  salary_min: z.string().optional(),
  salary_max: z.string().optional(),
  salary_info: z.string().max(2000).optional(),
  required_skills: z.string().max(5000).optional(),
  technologies: z.string().max(5000).optional(),
  job_posting_url: z.string().max(255).url("URL invalide").optional().or(z.literal('')),
  job_description: z.string().max(5000).optional(),
  recruitment_process: z.string().max(10000).optional(),

  // Application fields
  application_date: z.date({ required_error: "Date requise" }),
  status: z.nativeEnum(ApplicationStatus).optional(),
  salary_expectation: z.coerce.number().optional().or(z.literal('')),
  resume_used_id: z.string().optional().or(z.literal('')),
  cover_letter_id: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.salary_min && data.salary_max) {
    const min = parseFloat(data.salary_min);
    const max = parseFloat(data.salary_max);
    if (!isNaN(min) && !isNaN(max) && max < min) return false;
  }
  return true;
}, {
  message: "Le salaire maximum doit être supérieur au minimum",
  path: ["salary_max"],
});

interface WizardStepInitFormProps {
  onSuccess: (applicationId: number, opportunityId: number) => void;
  className?: string;
}

export function WizardStepInitForm({ onSuccess, className }: WizardStepInitFormProps) {
  const { mutate: createWizard, isPending, error } = useWizardInitMutation();

  const form = useForm<WizardInitFormValues>({
    resolver: zodResolver(wizardInitSchema),
    defaultValues: {
      // Opportunity defaults
      job_title: '',
      application_type: 'job_posting',
      company_id: undefined,
      position_type: '',
      source: '',
      contract_type: undefined,
      location: '',
      remote_policy: undefined,
      remote_details: '',
      salary_min: '',
      salary_max: '',
      salary_info: '',
      required_skills: '',
      technologies: '',
      job_posting_url: '',
      job_description: '',
      recruitment_process: '',

      // Application defaults
      application_date: new Date(),
      status: ApplicationStatus.pending,
      salary_expectation: '',
      resume_used_id: '',
      cover_letter_id: '',
    },
  });

  function onSubmit(values: WizardInitFormValues) {
    const parseId = (val?: string | null) => (val && val.trim() !== "") ? parseInt(val) : null;

    const payload = {
      opportunity: {
        job_title: values.job_title,
        application_type: values.application_type,
        company_id: parseId(values.company_id),
        position_type: values.position_type || null,
        source: values.source || null,
        contract_type: values.contract_type || null,
        location: values.location || null,
        remote_policy: values.remote_policy || null,
        remote_details: values.remote_details || null,
        salary_min: values.salary_min ? parseFloat(values.salary_min) : undefined,
        salary_max: values.salary_max ? parseFloat(values.salary_max) : undefined,
        salary_info: values.salary_info || null,
        required_skills: values.required_skills || null,
        technologies: values.technologies || null,
        job_posting_url: values.job_posting_url || null,
        job_description: values.job_description || null,
        recruitment_process: values.recruitment_process || null,
      },
      application: {
        application_date: values.application_date.toISOString().split('T')[0],
        status: values.status,
        salary_expectation: values.salary_expectation ? Number(values.salary_expectation) : null,
        resume_used_id: parseId(values.resume_used_id),
        cover_letter_id: parseId(values.cover_letter_id),
      }
    };

    createWizard(
      { data: payload },
      {
        onSuccess: (response) => {
          onSuccess(response.id, response.opportunity_id);
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-8 ${className} pr-2 max-h-[70vh] overflow-y-auto`}
      >

        {/* Opportunity Section */}
        <div className="space-y-6 p-6">
          <h3 className="text-xl font-semibold text-primary">Opportunité</h3>
          <OpportunityFormFields control={form.control} />
        </div>

        {/* Application Section */}
        <div className="space-y-6 p-6">
          <h3 className="text-xl font-semibold text-primary">Candidature</h3>
          <ApplicationFormFields
            control={form.control}
            hideOpportunitySelect={true}
            hideArchiveSwitch={true}
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de la création. Vérifiez les champs.
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
                Création en cours...
              </>
            ) : (
              "Créer et Continuer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

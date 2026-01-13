import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Briefcase,
  Tag,
  Globe,
  MapPin,
  Wifi,
  Euro,
  Info,
  Link as LinkIcon
} from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreateOpportunity } from '@/hooks/use-create-opportunity';
import { useUpdateOpportunity } from '@/hooks/use-update-opportunity';
import { useCompanies } from '@/hooks/use-companies';
import { Opportunity } from '@/api/model';

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

export function OpportunityForm({ onSuccess, className, initialData }: OpportunityFormProps) {
  const { companies, isLoading: isLoadingCompanies } = useCompanies();
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
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}>

        {/* --- SECTION 1: ESSENTIALS --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Informations Principales</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SmartFormField
              control={form.control}
              name="job_title"
              label="Titre du poste *"
              component={Input}
              placeholder="Ex: Senior Backend Developer"
              leadingIcon={Briefcase}
              maxLength={255}
            />

            <SmartFormField
              control={form.control}
              name="company_id"
              label="Entreprise"
            >
              {(field) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCompanies}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner (Optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </SmartFormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SmartFormField
              control={form.control}
              name="position_type"
              label="Type de poste"
              component={Input}
              placeholder="Ex: Backend, DevOps..."
              leadingIcon={Tag}
              maxLength={100}
            />

            <SmartFormField
              control={form.control}
              name="application_type"
              label="Type de candidature *"
            >
              {(field) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_posting">Offre d'emploi</SelectItem>
                    <SelectItem value="spontaneous">Spontanée</SelectItem>
                    <SelectItem value="reached_out">Contact Recruteur</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </SmartFormField>
          </div>

          <SmartFormField
            control={form.control}
            name="source"
            label="Source"
            component={Input}
            placeholder="Ex: LinkedIn, Malt, Chasseur de tête..."
            leadingIcon={Globe}
            maxLength={100}
          />
        </div>

        {/* --- SECTION 2: CONTRACT & LOCATION --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Contrat & Localisation</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SmartFormField
              control={form.control}
              name="contract_type"
              label="Type de Contrat"
            >
              {(field) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Non spécifié" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">CDI</SelectItem>
                    <SelectItem value="fixed_term">CDD</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="contractor">Portage</SelectItem>
                    <SelectItem value="internship">Stage</SelectItem>
                    <SelectItem value="apprenticeship">Alternance</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </SmartFormField>

            <SmartFormField
              control={form.control}
              name="location"
              label="Ville / Pays"
              component={Input}
              placeholder="Ex: Paris"
              leadingIcon={MapPin}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SmartFormField
              control={form.control}
              name="remote_policy"
              label="Politique Télétravail"
            >
              {(field) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Non spécifié" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_site">Sur site (100%)</SelectItem>
                    <SelectItem value="full_remote">Full Remote</SelectItem>
                    <SelectItem value="hybrid">Hybride</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </SmartFormField>

            <SmartFormField
              control={form.control}
              name="remote_details"
              label="Détails Télétravail"
              component={Input}
              placeholder="Ex: 2 jours/semaine, obligatoire le mardi..."
              leadingIcon={Wifi}
              maxLength={5000}
            />
          </div>
        </div>

        {/* --- SECTION 3: SALARY --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Rémunération</h3>
          <div className="grid grid-cols-2 gap-4">
            <SmartFormField
              control={form.control}
              name="salary_min"
              label="Min (€)"
              component={Input}
              type="number"
              placeholder="40000"
              leadingIcon={Euro}
            />
            <SmartFormField
              control={form.control}
              name="salary_max"
              label="Max (€)"
              component={Input}
              type="number"
              placeholder="55000"
              leadingIcon={Euro}
            />
          </div>
          <SmartFormField
            control={form.control}
            name="salary_info"
            label="Infos Rémunération"
            component={Input}
            placeholder="Ex: + BSPCE, primes, participation..."
            leadingIcon={Info}
            maxLength={2000}
          />
        </div>

        {/* --- SECTION 4: TECH & SKILLS --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Compétences</h3>
          <SmartFormField
            control={form.control}
            name="required_skills"
            label="Compétences requises"
            component={Textarea}
            placeholder="Ex: Anglais courant, Gestion de projet..."
            maxLength={5000}
            showCharCount
          />
          <SmartFormField
            control={form.control}
            name="technologies"
            label="Technologies"
            component={Textarea}
            placeholder="Ex: Python, React, AWS, Docker..."
            maxLength={5000}
            showCharCount
          />
        </div>

        {/* --- SECTION 5: DETAILS --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Détails</h3>
          <SmartFormField
            control={form.control}
            name="job_posting_url"
            label="Lien de l'offre"
            component={Input}
            placeholder="https://..."
            leadingIcon={LinkIcon}
            maxLength={255}
          />
          <SmartFormField
            control={form.control}
            name="job_description"
            label="Description complète"
            component={Textarea}
            placeholder="Collez la description ici..."
            maxLength={5000}
            showCharCount
          />
          <SmartFormField
            control={form.control}
            name="recruitment_process"
            label="Processus de recrutement"
            component={Textarea}
            placeholder="Ex: 1. RH, 2. Tech, 3. Fit..."
            maxLength={10000}
            showCharCount
          />
        </div>

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

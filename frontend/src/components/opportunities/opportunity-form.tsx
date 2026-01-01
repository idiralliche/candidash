import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      job_title: initialData?.job_title || '',
      application_type: initialData?.application_type || 'job_posting',
      company_id: initialData?.company_id ? initialData.company_id.toString() : undefined,
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
      form.reset({
        job_title: initialData.job_title,
        application_type: initialData.application_type,
        company_id: initialData.company_id?.toString(),
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
    // Parse numbers manually
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
            {/* Job Title (Required) */}
            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Titre du poste *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Senior Backend Developer" {...field} maxLength={255} className="bg-black-medium border-white-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company (Optional) */}
            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Entreprise</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCompanies}>
                    <FormControl>
                      <SelectTrigger className="bg-black-medium border-white-light text-white">
                        <SelectValue placeholder="Sélectionner (Optionnel)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies?.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Position Type */}
            <FormField
              control={form.control}
              name="position_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Type de poste</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Backend, DevOps..." {...field} maxLength={100} className="bg-black-medium border-white-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Application Type (Required) */}
            <FormField
              control={form.control}
              name="application_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Type de candidature *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black-medium border-white-light text-white">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="job_posting">Offre d'emploi</SelectItem>
                      <SelectItem value="spontaneous">Spontanée</SelectItem>
                      <SelectItem value="reached_out">Contact Recruteur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Source */}
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Source</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: LinkedIn, Malt, Chasseur de tête..." {...field} maxLength={100} className="bg-black-medium border-white-light text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- SECTION 2: CONTRACT & LOCATION --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Contrat & Localisation</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="contract_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Type de Contrat</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black-medium border-white-light text-white">
                        <SelectValue placeholder="Non spécifié" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="permanent">CDI</SelectItem>
                      <SelectItem value="fixed_term">CDD</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="contractor">Portage</SelectItem>
                      <SelectItem value="internship">Stage</SelectItem>
                      <SelectItem value="apprenticeship">Alternance</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Ville / Pays</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Paris" {...field} maxLength={500} className="bg-black-medium border-white-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="remote_policy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Politique Télétravail</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black-medium border-white-light text-white">
                        <SelectValue placeholder="Non spécifié" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="on_site">Sur site (100%)</SelectItem>
                      <SelectItem value="full_remote">Full Remote</SelectItem>
                      <SelectItem value="hybrid">Hybride</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="remote_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Détails Télétravail</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2 jours/semaine, obligatoire le mardi..." {...field} maxLength={5000} className="bg-black-medium border-white-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* --- SECTION 3: SALARY --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Rémunération</h3>
          <div className="grid grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="salary_min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Min (€)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="40000" {...field} className="bg-black-medium border-white-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="salary_max"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Max (€)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="55000" {...field} className="bg-black-medium border-white-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
           <FormField
              control={form.control}
              name="salary_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Infos Rémunération</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: + BSPCE, primes, participation..." {...field} maxLength={2000} className="bg-black-medium border-white-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        {/* --- SECTION 4: TECH & SKILLS --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Compétences</h3>
           <FormField
              control={form.control}
              name="required_skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Compétences requises</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Anglais courant, Gestion de projet..."
                      {...field}
                      maxLength={5000}
                      className="bg-black-medium border-white-light text-white min-h-[60px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="technologies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Technologies</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Python, React, AWS, Docker..."
                      {...field}
                      maxLength={5000}
                      className="bg-black-medium border-white-light text-white min-h-[60px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        {/* --- SECTION 5: DETAILS --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Détails</h3>
           <FormField
              control={form.control}
              name="job_posting_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Lien de l'offre</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} maxLength={255} className="bg-black-medium border-white-light text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="job_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Description complète</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Collez la description ici..."
                      {...field}
                      maxLength={5000}
                      className="bg-black-medium border-white-light text-white min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="recruitment_process"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Processus de recrutement</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: 1. RH, 2. Tech, 3. Fit..."
                      {...field}
                      maxLength={10000}
                      className="bg-black-medium border-white-light text-white min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de la création de l'opportunité.
          </div>
        )}

        <div className="pt-4 sticky bottom-0 pb-2">
           <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? "Enregistrer les modifications" : "Ajouter l'opportunité")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

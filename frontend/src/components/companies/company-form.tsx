import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Globe,
  MapPin,
  Briefcase,
  Hash,
  Building2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSwitch } from "@/components/ui/form-switch";
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import { useCompanies } from '@/hooks/companies/use-companies';
import { useCreateCompany } from '@/hooks/companies/use-create-company';
import { useUpdateCompany } from '@/hooks/companies/use-update-company';
import { Company } from '@/api/model';

const companySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(255, "Maximum 255 caractères"),
  siret: z.string().max(14).refine((val) => !val || /^\d{14}$/.test(val), {
      message: "Le SIRET doit contenir exactement 14 chiffres",
    }).optional(),
  website: z.string().max(255).url({ message: "URL invalide" }).optional().or(z.literal('')),
  headquarters: z.string().max(500).optional(),
  is_intermediary: z.boolean().default(false),
  company_type: z.string().max(100).refine((val) => !val || val.length >= 2, {message: "Min 2 caractères"}).optional(),
  industry: z.string().max(100).refine((val) => !val || val.length >= 2, {message: "Min 2 caractères"}).optional(),
  notes: z.string().max(50000).optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  onSuccess?: (company?: Company) => void;
  className?: string;
  initialData?: Company;
}

export function CompanyForm({ onSuccess, className, initialData }: CompanyFormProps) {
  const { companies } = useCompanies();
  const {
    mutateAsync: createCompany,
    isPending: isCreating,
    error
  } = useCreateCompany();

  const {
    mutateAsync: updateCompany,
    isPending: isUpdating
  } = useUpdateCompany();

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;

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

  async function onSubmit(values: CompanyFormValues) {
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-4 ${className} pr-2 max-h-[80vh] overflow-y-auto`}
      >

        {/* Name */}
        <SmartFormField
          control={form.control}
          name="name"
          label="Nom de l'entreprise *"
          component={Input}
          placeholder="Ex: TechCorp"
          leadingIcon={Building2}
        />

        {/* Intermediary Switch */}
        <SmartFormField
          control={form.control}
          name="is_intermediary"
        >
          {(field) => (
            <FormSwitch
              {...field}
              label="Est-ce un intermédiaire ?"
              description="Cochez cette case s'il s'agit d'un cabinet de recrutement ou d'une ESN."
            />
          )}
        </SmartFormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* SIRET */}
          <SmartFormField
            control={form.control}
            name="siret"
            label="SIRET"
            component={Input}
            placeholder="14 chiffres"
            leadingIcon={Hash}
            maxLength={14}
          />

          {/* Company Type */}
          <SmartFormField
            control={form.control}
            name="company_type"
            label="Type d'entreprise"
            component={Input}
            placeholder="Ex: Startup, PME, Grand Groupe..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
           {/* Industry */}
           <SmartFormField
            control={form.control}
            name="industry"
            label="Secteur d'activité"
            component={Input}
            placeholder="Ex: Fintech, Santé..."
            leadingIcon={Briefcase}
           />

          {/* Headquarters */}
          <SmartFormField
            control={form.control}
            name="headquarters"
            label="Siège Social"
            component={Input}
            placeholder="Ville, Pays"
            leadingIcon={MapPin}
          />
        </div>

        {/* Website */}
        <SmartFormField
          control={form.control}
          name="website"
          label="Site Web"
          component={Input}
          placeholder="https://..."
          leadingIcon={Globe}
        />

        {/* Notes */}
        <SmartFormField
          control={form.control}
          name="notes"
          label="Notes"
          component={Textarea}
          placeholder="Informations complémentaires..."
          maxLength={50000}
        />

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center animate-in fade-in slide-in-from-top-1">
            Une erreur est survenue lors de la création.
          </div>
        )}

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
            isEditing ? "Enregistrer les modifications" : "Ajouter l'entreprise"
          )}
        </Button>
      </form>
    </Form>
  );
}

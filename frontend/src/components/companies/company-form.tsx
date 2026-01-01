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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCompanies } from '@/hooks/use-companies';
import { useCreateCompany } from '@/hooks/use-create-company';
import { useUpdateCompany } from '@/hooks/use-update-company';
import { Company } from '@/api/model';

// Validation schema
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
  onSuccess?: () => void;
  className?: string;
  initialData?: Company;
}

export function CompanyForm({ onSuccess, className, initialData }: CompanyFormProps) {
  const { companies } = useCompanies();
  const { mutate: createCompany, isPending: isCreating, error } = useCreateCompany();
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;

  const form = useForm<CompanyFormValues>({
    // Logic to switch between Edit values and Empty values
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

  // Reset form when initialData changes (important if reusing the same modal instance)
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

  function onSubmit(values: CompanyFormValues) {
    // Client-side Duplicate Check (only if SIRET changed or creating new)
    if (values.siret && companies) {
      // Exclude current company from check if editing
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

    const options = {
      onSuccess: () => {
        form.reset();
        if (onSuccess) onSuccess();
      },
    };

    if (isEditing && initialData) {
      // UPDATE MODE
      updateCompany({
        companyId: initialData.id,
        data: payload
      }, options);
    } else {
      // CREATE MODE
      createCompany({
        data: payload
      }, options);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className} pr-2 max-h-[80vh] overflow-y-auto`}>

        {/* Name (required) */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Nom de l'entreprise *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: TechCorp"
                  leadingIcon={Building2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Intermediary Checkbox */}
        <FormField
          control={form.control}
          name="is_intermediary"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white-light p-4 bg-black-medium">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-white">
                  Est-ce un intermédiaire ?
                </FormLabel>
                <FormDescription>
                  Cochez cette case s'il s'agit d'un cabinet de recrutement ou d'une ESN.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* SIRET */}
          <FormField
            control={form.control}
            name="siret"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">SIRET</FormLabel>
                <FormControl>
                  <Input
                    placeholder="14 chiffres"
                    leadingIcon={Hash}
                    maxLength={14}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Company Type */}
          <FormField
            control={form.control}
            name="company_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Type d'entreprise</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Startup, PME, Grand Groupe..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
           {/* Industry */}
           <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Secteur d'activité</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Fintech, Santé..."
                    leadingIcon={Briefcase}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Headquarters */}
          <FormField
            control={form.control}
            name="headquarters"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Siège Social</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ville, Pays"
                    leadingIcon={MapPin}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Website */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Site Web</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://..."
                  leadingIcon={Globe}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Informations complémentaires..." {...field} className="bg-black-medium border-white-light text-white min-h-[80px]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Une erreur est survenue lors de la création.
          </div>
        )}

        <div className="pt-4 pb-2">
          <Button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
              isEditing ? "Enregistrer les modifications" : "Ajouter l'entreprise"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

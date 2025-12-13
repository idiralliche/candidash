import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

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
import { useCreateCompany } from '@/hooks/use-create-company';

// Validation schema
const companySchema = z.object({
  name: z.string().min(1, { message: "Le nom est requis" }),
  siret: z.string()
    .length(14, { message: "Le SIRET doit faire exactement 14 chiffres" })
    .regex(/^\d+$/, { message: "Le SIRET ne doit contenir que des chiffres" })
    .or(z.literal('')), // Accepts empty string as valid
  website: z.string().url({ message: "URL invalide" }).or(z.literal('')),
  headquarters: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function CompanyForm({ onSuccess, className }: CompanyFormProps) {
  const { mutate: createCompany, isPending, error } = useCreateCompany();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      siret: '',
      website: '',
      headquarters: '',
      industry: '',
      notes: '',
    },
  });

  function onSubmit(values: CompanyFormValues) {
    // Clean up empty strings fore the api (convert '' to undefined or null if needed)
    // The API accepts missing optional fields
    createCompany({
      data: {
        name: values.name,
        // Sends undefined if empty string to comply with the API's optional schema
        siret: values.siret || undefined,
        website: values.website || undefined,
        headquarters: values.headquarters || undefined,
        industry: values.industry || undefined,
        notes: values.notes || undefined,
      }
    }, {
      onSuccess: () => {
        form.reset();
        if (onSuccess) {
          onSuccess();
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>

        {/* Name (required) */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Nom de l'entreprise *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: TechCorp" {...field} className="bg-black/20 border-white/10 text-white" />
              </FormControl>
              <FormMessage />
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
                  <Input placeholder="14 chiffres" {...field} maxLength={14} className="bg-black/20 border-white/10 text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website */}
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Site Web</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} className="bg-black/20 border-white/10 text-white" />
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
                  <Input placeholder="Ex: Informatique" {...field} className="bg-black/20 border-white/10 text-white" />
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
                  <Input placeholder="Ville, Pays" {...field} className="bg-black/20 border-white/10 text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Informations complémentaires..." {...field} className="bg-black/20 border-white/10 text-white min-h-[80px]" />
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

        <Button
          type="submit"
          className="w-full bg-primary text-white hover:bg-[#e84232]"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création...
            </>
          ) : (
            "Ajouter l'entreprise"
          )}
        </Button>
      </form>
    </Form>
  );
}

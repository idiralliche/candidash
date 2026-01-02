import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  User,
  Mail,
  Phone,
  Link as LinkIcon,
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreateContact } from '@/hooks/use-create-contact';
import { useUpdateContact } from '@/hooks/use-update-contact';
import { useCompanies } from '@/hooks/use-companies';
import { Contact } from '@/api/model';

// LinkedIn basic validation (URL or username)
const LINKEDIN_PATTERN = /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/([a-zA-Z0-9-]+)\/?$|^(?:in|company)\/([a-zA-Z0-9-]+)$/;

const contactSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis").max(100),
  last_name: z.string().min(1, "Le nom est requis").max(100),
  position: z.string().max(100).optional(),
  email: z.string().email("Email invalide").max(255).optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  linkedin: z.string().regex(LINKEDIN_PATTERN, "Format invalide (URL ou in/user)").optional().or(z.literal('')),
  company_id: z.string().optional(), // Select returns string
  is_independent_recruiter: z.boolean().default(false),
  relationship_notes: z.string().max(50000).optional(),
  notes: z.string().max(50000).optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSuccess?: () => void;
  className?: string;
  initialData?: Contact;
}

export function ContactForm({ onSuccess, className, initialData }: ContactFormProps) {
  const { mutate: createContact, isPending: isCreating, error: createError } = useCreateContact();
  const { mutate: updateContact, isPending: isUpdating, error: updateError } = useUpdateContact();
  const { companies, isLoading: isLoadingCompanies } = useCompanies();

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      position: initialData?.position || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      linkedin: initialData?.linkedin || '',
      company_id: initialData?.company_id ? String(initialData.company_id) : undefined,
      is_independent_recruiter: initialData?.is_independent_recruiter || false,
      relationship_notes: initialData?.relationship_notes || '',
      notes: initialData?.notes || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        first_name: initialData.first_name,
        last_name: initialData.last_name,
        position: initialData.position || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        linkedin: initialData.linkedin || '',
        company_id: initialData.company_id ? String(initialData.company_id) : undefined,
        is_independent_recruiter: initialData.is_independent_recruiter,
        relationship_notes: initialData.relationship_notes || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, form]);

  function onSubmit(values: ContactFormValues) {
    const companyId = values.company_id ? parseInt(values.company_id) : undefined;
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      company_id: companyId,
      // Manual convertion of Select (String -> Int)

      is_independent_recruiter: values.is_independent_recruiter,

      // Explicit null handeling for backend (PUT)
      position: values.position || null,
      email: values.email || null,
      phone: values.phone || null,
      linkedin: values.linkedin || null,
      relationship_notes: values.relationship_notes || null,
      notes: values.notes || null,
    };

    const options = {
      onSuccess: () => {
        form.reset();
        if (onSuccess) onSuccess();
      },
    };

    if (isEditing && initialData) {
      updateContact({ contactId: initialData.id, data: payload }, options);
    } else {
      createContact({ data: payload }, options);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}>

        {/* IDENTITY */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Identité</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Prénom *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nom *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Poste / Titre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Talent Acquisition Manager..."
                    leadingIcon={User}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* PROFESSIONAL CONTEXT */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Contexte Professionnel</h3>
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Entreprise liée</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingCompanies}>
                  <FormControl>
                    <SelectTrigger className="bg-black-medium border-white-light text-white">
                      <SelectValue placeholder="Aucune entreprise (Indépendant ou autre)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                      {companies?.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                </Select>
                <FormDescription className="text-xs text-gray-500">
                  Optionnel.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_independent_recruiter"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white-light bg-white-subtle p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-white">Recruteur Indépendant</FormLabel>
                  <FormDescription className="text-xs text-gray-400">
                    Cochez si ce contact est un chasseur de tête ou cabinet externe.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* COORDINATES */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Coordonnées</h3>
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@exemple.com"
                        leadingIcon={Mail}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-white">Téléphone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+33 6..."
                            leadingIcon={Phone}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-white">LinkedIn</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="in/username"
                            leadingIcon={LinkIcon}
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        </div>

        {/* NOTES */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Notes</h3>
            <FormField
                control={form.control}
                name="relationship_notes"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-white text-xs">Contexte de rencontre</FormLabel>
                    <FormControl>
                    <Textarea placeholder="Ancien collègue, contacté sur LinkedIn..." {...field} className="bg-black-medium border-white-light text-white min-h-[60px]" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-white text-xs">Notes générales</FormLabel>
                    <FormControl>
                    <Textarea placeholder="..." {...field} className="bg-black-medium border-white-light text-white min-h-[80px]" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de l'enregistrement. Vérifiez les données.
          </div>
        )}

        <div className="sticky bottom-0">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditing ? "Enregistrement..." : "Ajout en cours..."}
              </>
            ) : (
              isEditing ? "Enregistrer les modifications" : "Ajouter le contact"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

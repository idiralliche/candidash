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
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSwitch } from '@/components/ui/form-switch';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreateContact } from '@/hooks/contacts/use-create-contact';
import { useUpdateContact } from '@/hooks/contacts/use-update-contact';
import { useCompanies } from '@/hooks/companies/use-companies';
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
  company_id: z.string().optional(),
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

  const initialCompanyId = initialData?.company_id ?? initialData?.company?.id;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      position: initialData?.position || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      linkedin: initialData?.linkedin || '',
      company_id: initialCompanyId ? String(initialCompanyId) : undefined,
      is_independent_recruiter: initialData?.is_independent_recruiter || false,
      relationship_notes: initialData?.relationship_notes || '',
      notes: initialData?.notes || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      const companyId = initialData.company_id ?? initialData.company?.id;

      form.reset({
        first_name: initialData.first_name,
        last_name: initialData.last_name,
        position: initialData.position || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        linkedin: initialData.linkedin || '',
        company_id: companyId ? String(companyId) : undefined,
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
      is_independent_recruiter: values.is_independent_recruiter,
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
            <SmartFormField
              control={form.control}
              name="first_name"
              label="Prénom *"
              component={Input}
              placeholder="John"
            />
            <SmartFormField
              control={form.control}
              name="last_name"
              label="Nom *"
              component={Input}
              placeholder="Doe"
            />
          </div>
          <SmartFormField
            control={form.control}
            name="position"
            label="Poste / Titre"
            component={Input}
            placeholder="Talent Acquisition Manager..."
            leadingIcon={User}
          />
        </div>

        {/* PROFESSIONAL CONTEXT */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Contexte Professionnel</h3>

          <SmartFormField
            control={form.control}
            name="company_id"
            label="Entreprise liée"
            description="Optionnel."
          >
            {(field) => (
               <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingCompanies}
                >
                <SelectTrigger
                    onClear={field.value ? () => field.onChange("") : undefined}
                >
                  <SelectValue placeholder="Aucune entreprise (Indépendant ou autre)" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </SmartFormField>

          {/* Independent Recruiter Switch */}
          <SmartFormField
            control={form.control}
            name="is_independent_recruiter"
          >
            {(field) => (
              <FormSwitch
                {...field}
                label="Recruteur Indépendant"
                description="Cochez si ce contact est un chasseur de tête ou cabinet externe."
              />
            )}
          </SmartFormField>
        </div>

        {/* COORDINATES */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Coordonnées</h3>
          <SmartFormField
            control={form.control}
            name="email"
            label="Email"
            component={Input}
            placeholder="email@exemple.com"
            leadingIcon={Mail}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SmartFormField
              control={form.control}
              name="phone"
              label="Téléphone"
              component={Input}
              placeholder="+33 6..."
              leadingIcon={Phone}
            />
            <SmartFormField
              control={form.control}
              name="linkedin"
              label="LinkedIn"
              component={Input}
              placeholder="in/username"
              leadingIcon={LinkIcon}
            />
          </div>
        </div>

        {/* NOTES */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Notes</h3>
          <SmartFormField
            control={form.control}
            name="relationship_notes"
            label="Contexte de rencontre"
            component={Textarea}
            placeholder="Ancien collègue, contacté sur LinkedIn..."
            maxLength={50000}
          />
          <SmartFormField
            control={form.control}
            name="notes"
            label="Notes générales"
            component={Textarea}
            placeholder="..."
            maxLength={50000}
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
              isEditing ? "Enregistrer les modifications" : "Ajouter le contact"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

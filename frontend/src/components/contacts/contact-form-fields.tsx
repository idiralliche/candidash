import { Control } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  Link as LinkIcon,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSwitch } from '@/components/ui/form-switch';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import { SmartSelect } from '@/components/ui/smart-select';
import { useCompanies } from '@/hooks/companies/use-companies';
import { ContactFormValues } from '@/hooks/contacts/use-contact-form-logic';

interface ContactFormFieldsProps {
  control: Control<ContactFormValues>;
}

export function ContactFormFields({ control }: ContactFormFieldsProps) {
  const { companies, isLoading: isLoadingCompanies } = useCompanies();

  return (
    <>
      {/* IDENTITY */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Identité</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <SmartFormField
            control={control}
            name="first_name"
            label="Prénom *"
            component={Input}
            placeholder="John"
          />

          {/* Last Name */}
          <SmartFormField
            control={control}
            name="last_name"
            label="Nom *"
            component={Input}
            placeholder="Doe"
          />
        </div>

        {/* Position */}
        <SmartFormField
          control={control}
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
        {/* Linked Company */}
        <SmartFormField
          control={control}
          name="company_id"
          label="Entreprise liée"
          description="Optionnel."
        >
          <SmartSelect
            disabled={isLoadingCompanies}
            isOptional
            placeholder="Aucune entreprise (Indépendant ou autre)"
            items={companies?.map(c => ({
              key: c.id,
              value: c.id.toString(),
              label: c.name,
            }))}
          />
        </SmartFormField>

        {/* Independent Recruiter Switch */}
        <SmartFormField
          control={control}
          name="is_independent_recruiter"
        >
          <FormSwitch
            label="Recruteur Indépendant"
            description="Cochez si ce contact est un chasseur de tête ou cabinet externe."
          />
        </SmartFormField>
      </div>

      {/* COORDINATES */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Coordonnées</h3>
        {/* Email */}
        <SmartFormField
          control={control}
          name="email"
          label="Email"
          component={Input}
          placeholder="email@exemple.com"
          leadingIcon={Mail}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          <SmartFormField
            control={control}
            name="phone"
            label="Téléphone"
            component={Input}
            placeholder="+33 6..."
            leadingIcon={Phone}
          />

          {/* LinkedIn */}
          <SmartFormField
            control={control}
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
          control={control}
          name="relationship_notes"
          label="Contexte de rencontre"
          component={Textarea}
          placeholder="Ancien collègue, contacté sur LinkedIn..."
          maxLength={50000}
        />
        <SmartFormField
          control={control}
          name="notes"
          label="Notes générales"
          component={Textarea}
          placeholder="..."
          maxLength={50000}
        />
      </div>
    </>
  );
}

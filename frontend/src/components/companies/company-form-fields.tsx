import { Control } from 'react-hook-form';
import {
  Globe,
  MapPin,
  Briefcase,
  Hash,
  Building2,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSwitch } from "@/components/ui/form-switch";
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import { CompanyFormValues } from '@/hooks/companies/use-company-form-logic';

interface CompanyFormFieldsProps {
  control: Control<CompanyFormValues>;
}

export function CompanyFormFields({ control }: CompanyFormFieldsProps) {
  return (
    <>
      {/* Name */}
      <SmartFormField
        control={control}
        name="name"
        label="Nom de l'entreprise *"
        component={Input}
        placeholder="Ex: TechCorp"
        leadingIcon={Building2}
      />

      {/* Intermediary Switch */}
      <SmartFormField
        control={control}
        name="is_intermediary"
      >
        <FormSwitch
          label="Est-ce un intermédiaire ?"
          description="Cochez cette case s'il s'agit d'un cabinet de recrutement ou d'une ESN."
        />
      </SmartFormField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* SIRET */}
        <SmartFormField
          control={control}
          name="siret"
          label="SIRET"
          component={Input}
          placeholder="14 chiffres"
          leadingIcon={Hash}
          maxLength={14}
          showCharCount
        />

        {/* Company Type */}
        <SmartFormField
          control={control}
          name="company_type"
          label="Type d'entreprise"
          component={Input}
          placeholder="Ex: Startup, PME, Grand Groupe..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
         {/* Industry */}
         <SmartFormField
          control={control}
          name="industry"
          label="Secteur d'activité"
          component={Input}
          placeholder="Ex: Fintech, Santé..."
          leadingIcon={Briefcase}
         />

        {/* Headquarters */}
        <SmartFormField
          control={control}
          name="headquarters"
          label="Adresse Principale"
          component={Input}
          placeholder="Ville, Pays"
          leadingIcon={MapPin}
        />
      </div>

      {/* Website */}
      <SmartFormField
        control={control}
        name="website"
        label="Site Web"
        component={Input}
        type="url"
        placeholder="https://..."
        leadingIcon={Globe}
      />

      {/* Notes */}
      <SmartFormField
        control={control}
        name="notes"
        label="Notes"
        component={Textarea}
        placeholder="Informations complémentaires..."
        maxLength={50000}
      />
    </>
  );
}

import {
  Control,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import {
  Briefcase,
  Tag,
  Globe,
  MapPin,
  Wifi,
  Euro,
  Info,
  Link as LinkIcon,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import { SmartSelect } from '@/components/ui/smart-select';
import { useCompanies } from '@/hooks/companies/use-companies';
import {
  LABELS_CONTRACT,
  LABELS_APPLICATION,
  LABELS_REMOTE,
  getLabel,
} from '@/lib/dictionaries';

export type OpportunityFormData = {
  job_title: string;
  application_type: 'job_posting' | 'spontaneous' | 'reached_out';
  company_id?: string;
  position_type?: string;
  source?: string;
  contract_type?: 'permanent' | 'fixed_term' | 'freelance' | 'contractor' | 'internship' | 'apprenticeship';
  location?: string;
  remote_policy?: 'on_site' | 'full_remote' | 'hybrid' | 'flexible';
  remote_details?: string;
  salary_min?: string;
  salary_max?: string;
  salary_info?: string;
  required_skills?: string;
  technologies?: string;
  job_posting_url?: string;
  job_description?: string;
  recruitment_process?: string;
};

interface OpportunityFormFieldsProps<T extends FieldValues> {
  control: Control<T>;
}

export function OpportunityFormFields<T extends OpportunityFormData>({
  control,
}: OpportunityFormFieldsProps<T>) {
  const { companies, isLoading: isLoadingCompanies } = useCompanies();

  return (
    <>
      {/* --- SECTION 1: ESSENTIALS --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Informations Principales</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SmartFormField
            control={control}
            name={"job_title" as FieldPath<T>}
            label="Titre du poste *"
            component={Input}
            placeholder="Ex: Senior Backend Developer"
            leadingIcon={Briefcase}
            maxLength={255}
          />

          <SmartFormField
            control={control}
            name={"company_id" as FieldPath<T>}
            label="Entreprise"
          >
            <SmartSelect
              disabled={isLoadingCompanies}
              isOptional
              items={companies?.map(c => ({
                key: c.id,
                value: c.id.toString(),
                label: c.name,
              }))}
            />
          </SmartFormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SmartFormField
            control={control}
            name={"position_type" as FieldPath<T>}
            label="Type de poste"
            component={Input}
            placeholder="Ex: Backend, DevOps..."
            leadingIcon={Tag}
            maxLength={100}
          />

          <SmartFormField
            control={control}
            name={"application_type" as FieldPath<T>}
            label="Type de candidature *"
          >
            <SmartSelect
              items={Object.keys(LABELS_APPLICATION).map((key) => ({
                value: key,
                label: getLabel(LABELS_APPLICATION, key),
              }))}
            />
          </SmartFormField>
        </div>

        <SmartFormField
          control={control}
          name={"source" as FieldPath<T>}
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
            control={control}
            name={"contract_type" as FieldPath<T>}
            label="Type de Contrat"
          >
            <SmartSelect
              placeholder="Non spécifié"
              isOptional
              items={Object.keys(LABELS_CONTRACT).map((key) => ({
                value: key,
                label: getLabel(LABELS_CONTRACT, key),
              }))}
            />
          </SmartFormField>

          <SmartFormField
            control={control}
            name={"location" as FieldPath<T>}
            label="Ville / Pays"
            component={Input}
            placeholder="Ex: Paris"
            leadingIcon={MapPin}
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SmartFormField
            control={control}
            name={"remote_policy" as FieldPath<T>}
            label="Politique Télétravail"
          >
            <SmartSelect
              placeholder="Non spécifié"
              isOptional
              items={Object.keys(LABELS_REMOTE).map((key) => ({
                value: key,
                label: getLabel(LABELS_REMOTE, key),
              }))}
            />
          </SmartFormField>

          <SmartFormField
            control={control}
            name={"remote_details" as FieldPath<T>}
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
            control={control}
            name={"salary_min" as FieldPath<T>}
            label="Min (€)"
            component={Input}
            type="number"
            placeholder="40000"
            leadingIcon={Euro}
          />
          <SmartFormField
            control={control}
            name={"salary_max" as FieldPath<T>}
            label="Max (€)"
            component={Input}
            type="number"
            placeholder="55000"
            leadingIcon={Euro}
          />
        </div>
        <SmartFormField
          control={control}
          name={"salary_info" as FieldPath<T>}
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
          control={control}
          name={"required_skills" as FieldPath<T>}
          label="Compétences requises"
          component={Textarea}
          placeholder="Ex: Anglais courant, Gestion de projet..."
          maxLength={5000}
          showCharCount
        />
        <SmartFormField
          control={control}
          name={"technologies" as FieldPath<T>}
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
          control={control}
          name={"job_posting_url" as FieldPath<T>}
          label="Lien de l'offre"
          component={Input}
          placeholder="https://..."
          leadingIcon={LinkIcon}
          maxLength={255}
        />
        <SmartFormField
          control={control}
          name={"job_description" as FieldPath<T>}
          label="Description complète"
          component={Textarea}
          placeholder="Collez la description ici..."
          maxLength={5000}
          showCharCount
        />
        <SmartFormField
          control={control}
          name={"recruitment_process" as FieldPath<T>}
          label="Processus de recrutement"
          component={Textarea}
          placeholder="Ex: 1. RH, 2. Tech, 3. Fit..."
          maxLength={10000}
          showCharCount
        />
      </div>
    </>
  );
}

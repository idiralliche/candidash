import {
  Control,
  Path,
  FieldValues,
} from 'react-hook-form';import {
  Banknote,
  FileText,
  Mail,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { FormSwitch } from '@/components/ui/form-switch';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import { SmartSelect } from '@/components/ui/smart-select';
import { DatePicker } from '@/components/ui/date-picker';
import { useOpportunities } from '@/hooks/opportunities/use-opportunities';
import { useDocuments } from '@/hooks/documents/use-documents';
import { ApplicationStatus } from '@/api/model';
import {
  LABELS_APPLICATION_STATUS,
  getLabel,
} from '@/lib/dictionaries';

export type ApplicationFormData = {
  opportunity_id?: string;
  application_date: Date;
  status?: ApplicationStatus;
  salary_expectation?: number | string;
  resume_used_id?: string;
  cover_letter_id?: string;
  is_archived?: boolean;
};

interface ApplicationFormFieldsProps<T extends FieldValues> {
  control: Control<T>;
  hideOpportunitySelect?: boolean;
  hideArchiveSwitch?: boolean;
}

export function ApplicationFormFields<T extends FieldValues>({
  control,
  hideOpportunitySelect,
  hideArchiveSwitch,
}: ApplicationFormFieldsProps<T>) {
  const { opportunities, isLoading: isLoadingOpportunities } = useOpportunities();
  const { documents, isLoading: isLoadingDocuments } = useDocuments();

  return (
    <>
      {/* Opportunity */}
      {!hideOpportunitySelect && ( // pre-selected in wizard form
        <SmartFormField
          control={control}
          name={"opportunity_id" as Path<T>}
          label="Opportunité *"
          description="Le poste auquel vous postulez."
        >
          <SmartSelect
            disabled={isLoadingOpportunities}
            placeholder={{topic: "opportunité", suffix:"e"}}
            items={opportunities?.map(op => ({
              key: op.id,
              value: op.id.toString(),
              label: op.job_title
            }))}
          />
        </SmartFormField>
      )}

      {/* --- DETAILS --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Détails</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Application Date */}
          <SmartFormField
            control={control}
            name={"application_date" as Path<T>}
            label="Date de candidature *"
          >
            <DatePicker disabled={false} />
          </SmartFormField>

          {/* Status */}
          <SmartFormField
            control={control}
            name={"status" as Path<T>}
            label="Statut *"
          >
            <SmartSelect
              disabled={isLoadingOpportunities}
              placeholder="Statut"
              items={Object.values(ApplicationStatus).map((status) => ({
                value: status,
                label: getLabel(LABELS_APPLICATION_STATUS, status),
              }))}
            />
          </SmartFormField>
        </div>

        <SmartFormField
          control={control}
          name={"salary_expectation" as Path<T>}
          label="Prétentions Salariales (€)"
          component={Input}
          type="number"
          placeholder="Ex: 45000"
          leadingIcon={Banknote}
        />
      </div>

      {/* --- DOCUMENTS --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Documents</h3>

        {/* Resume */}
        <SmartFormField
          control={control}
          name={"resume_used_id" as Path<T>}
          label="CV utilisé"
        >
          <SmartSelect
            disabled={isLoadingDocuments}
            isOptional
            icon={FileText}
            placeholder={{topic: "CV"}}
            items={documents?.map(doc => ({
              key: doc.id,
              value: doc.id.toString(),
              label: doc.name,
            }))}
          />
        </SmartFormField>

        {/* Cover Letter */}
        <SmartFormField
          control={control}
          name={"cover_letter_id" as Path<T>}
          label="Lettre de motivation"
        >
          <SmartSelect
            disabled={isLoadingDocuments}
            isOptional
            icon={Mail}
            placeholder={{topic: "lettre", suffix: "e"}}
            items={documents?.map(doc => ({
              key: doc.id,
              value: doc.id.toString(),
              label: doc.name,
            }))}
          />
        </SmartFormField>
      </div>

      {/* Archive Switch */}
      {!hideArchiveSwitch && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Archiver</h3>
          <SmartFormField
            control={control}
            name={"is_archived" as Path<T>}
          >
            <FormSwitch
              label="Archiver cette candidature"
              description="Masque la candidature des listes par défaut."
            />
          </SmartFormField>
        </div>
      )}
    </>
  );
}

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
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
      {/* Opportunity Select (conditionally hidden) */}
      {!hideOpportunitySelect && (
        <SmartFormField
          control={control}
          name={"opportunity_id" as Path<T>}
          label="Opportunité *"
          description="Le poste auquel vous postulez."
        >
          {(field) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isLoadingOpportunities}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une opportunité" />
              </SelectTrigger>
              <SelectContent>
                {opportunities?.map(op => (
                  <SelectItem key={op.id} value={op.id.toString()}>
                    {op.job_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </SmartFormField>
      )}

      {/* --- DETAILS --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Détails</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Picker */}
          <SmartFormField
            control={control}
            name={"application_date" as Path<T>}
            label="Date de candidature *"
          >
            {(field) => (
              <DatePicker
                date={field.value}
                onSelect={field.onChange}
                disabled={false}
              />
            )}
          </SmartFormField>

          {/* Status Select */}
          <SmartFormField
            control={control}
            name={"status" as Path<T>}
            label="Statut *"
          >
            {(field) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ApplicationStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {getLabel(LABELS_APPLICATION_STATUS, status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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

        {/* Resume Select with Clear Button */}
        <SmartFormField
          control={control}
          name={"resume_used_id" as Path<T>}
          label="CV utilisé"
        >
          {(field) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isLoadingDocuments}
            >
              <SelectTrigger
                className="w-full"
                onClear={field.value ? () => field.onChange("") : undefined}
              >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Sélectionner un CV" />
                  </div>
              </SelectTrigger>
              <SelectContent>
                {documents?.map(doc => (
                  <SelectItem key={doc.id} value={doc.id.toString()}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </SmartFormField>

        {/* Cover Letter Select with Clear Button */}
        <SmartFormField
          control={control}
          name={"cover_letter_id" as Path<T>}
          label="Lettre de motivation"
        >
          {(field) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isLoadingDocuments}
            >
              <SelectTrigger
                className="w-full"
                onClear={field.value ? () => field.onChange("") : undefined}
              >
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Sélectionner une lettre" />
                  </div>
              </SelectTrigger>
              <SelectContent>
                {documents?.map(doc => (
                  <SelectItem key={doc.id} value={doc.id.toString()}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </SmartFormField>
      </div>

      {/* Archive Switch (conditionally hidden) */}
      {!hideArchiveSwitch && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Archiver</h3>
          <SmartFormField
            control={control}
            name={"is_archived" as Path<T>}
          >
            {(field) => (
              <FormSwitch
                {...field}
                label="Archiver cette candidature"
                description="Masque la candidature des listes par défaut."
              />
            )}
          </SmartFormField>
        </div>
      )}
    </>
  );
}

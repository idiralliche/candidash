import { Control, Path, FieldValues } from 'react-hook-form';
import {
  Pin,
  Unplug,
  Contact,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSwitch } from '@/components/ui/form-switch';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import { SmartSelect } from '@/components/ui/smart-select';
import { useContacts } from '@/hooks/contacts/use-contacts';
import { useOpportunities } from '@/hooks/opportunities/use-opportunities';

interface OpportunityContactFormFieldsProps<T extends FieldValues> {
  control: Control<T>;
  isEditing: boolean;
  hideOpportunitySelect?: boolean;
  hideContactSelect?: boolean;
}

export function OpportunityContactFormFields<T extends FieldValues>({
  control,
  isEditing,
  hideOpportunitySelect,
  hideContactSelect
}: OpportunityContactFormFieldsProps<T>) {
  // Fetch data only if needed (not editing AND select is visible)
  const shouldFetchContacts = !isEditing && !hideContactSelect;
  const shouldFetchOpportunities = !isEditing && !hideOpportunitySelect;

  const { contacts, isLoading: isLoadingContacts } = useContacts(
    shouldFetchContacts ? {} : { limit: 0 }
  );

  const { opportunities, isLoading: isLoadingOpportunities } = useOpportunities(
    shouldFetchOpportunities ? {} : { limit: 0 }
  );

  return (
    <>
      {/* --- ASSOCIATION --- */}
      {/* Create Mode Only: Show Selects if not hidden */}
      {!isEditing && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Association</h3>

          <div className={cn(
              "grid grid-cols-1 gap-4 w-full",
              (!hideContactSelect && !hideOpportunitySelect) && "md:grid-cols-2"
          )}>
             {/* Select Contact */}
            {!hideContactSelect && (
              <SmartFormField
                control={control}
                name={"contact_id" as Path<T>}
                label="Contact *"
                description="La personne à associer."
              >
                <SmartSelect
                  disabled={isLoadingContacts}
                  placeholder={{topic: "contact"}}
                  icon={Contact}
                  items={contacts?.map(c => ({
                    key: c.id,
                    value: c.id.toString(),
                    label: `${c.first_name} ${c.last_name}`,
                  }))}
                />
              </SmartFormField>
            )}

            {/* Select Opportunity */}
            {!hideOpportunitySelect && (
              <SmartFormField
                control={control}
                name={"opportunity_id" as Path<T>}
                label="Opportunité *"
                description="Le poste concerné."
              >
                <SmartSelect
                  disabled={isLoadingOpportunities}
                  placeholder={{topic: "opportunité", suffix: "e"}}
                  icon={Briefcase}
                  items={opportunities?.map(o => ({
                    key: o.id,
                    value: o.id.toString(),
                    label: `${o.job_title} - ${o.company?.name || ""}`,
                  }))}
                />
              </SmartFormField>
            )}
          </div>
        </div>
      )}

      {/* --- DETAILS DE LA RELATION --- */}
      <div className="space-y-4 pb-6">
        <h3 className="text-lg font-semibold text-primary">Détails de la relation</h3>

        {/* Primary Contact Switch */}
        <SmartFormField
          control={control}
          name={"is_primary_contact" as Path<T>}
        >
          <FormSwitch
            label="Contact Principal"
            description="Interlocuteur privilégié pour cette opportunité."
          />
        </SmartFormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role */}
          <SmartFormField
            control={control}
            name={"contact_role" as Path<T>}
            label="Rôle"
            component={Input}
            placeholder="Ex: Recruteur, Hiring Manager..."
            leadingIcon={Pin}
          />

          {/* Origin */}
          <SmartFormField
            control={control}
            name={"origin" as Path<T>}
            label="Origine du lien"
            component={Input}
            placeholder="Ex: Chasseur, Cooptation..."
            leadingIcon={Unplug}
          />
        </div>

        {/* Notes */}
        <SmartFormField
          control={control}
          name={"notes" as Path<T>}
          label="Notes contextuelles"
          component={Textarea}
          placeholder="Détails spécifiques à cette relation..."
          maxLength={5000}
        />
      </div>
    </>
  );
}

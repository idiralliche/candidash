import { SmartForm } from '@/components/shared/smart-form';
import { OpportunityContactFormFields } from '@/components/opportunities-contacts/opportunity-contact-form-fields';
import { OpportunityContact } from '@/api/model';
import { useOpportunityContactFormLogic } from '@/hooks/opportunity-contacts/use-opportunity-contact-form-logic';

interface OpportunityContactFormProps {
  onSuccess?: (data?: OpportunityContact) => void;
  className?: string;
  initialData?: OpportunityContact;
  preselectedOpportunityId?: number;
  preselectedContactId?: number;
}

export function OpportunityContactForm({
  onSuccess,
  className,
  initialData,
  preselectedOpportunityId,
  preselectedContactId
}: OpportunityContactFormProps) {
  const logic = useOpportunityContactFormLogic({
    initialData,
    preselectedOpportunityId,
    preselectedContactId,
    onSuccess
  });

  return (
    <SmartForm
      form={logic.form}
      onSubmit={logic.onSubmit}
      isPending={logic.isPending}
      className={className}
      error={logic.error}
      isEditing={logic.isEditing}
      saveActionLabel={
        (preselectedOpportunityId || preselectedContactId) ?
          "Associer" : "Enregistrer"
      }
      entityType={
        preselectedOpportunityId ?
          "contact" : preselectedContactId ?
            "opportunité" : "association"
      }
    >
      <OpportunityContactFormFields
        control={logic.form.control}
        isEditing={logic.isEditing}
        hideOpportunitySelect={!!preselectedOpportunityId}
        hideContactSelect={!!preselectedContactId}
      />
    </SmartForm>
  );
}

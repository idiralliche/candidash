import { SmartForm } from '@/components/shared/smart-form';
import { ContactFormFields } from '@/components/contacts/contact-form-fields';
import { Contact } from '@/api/model';
import { useContactFormLogic } from '@/hooks/contacts/use-contact-form-logic';

interface ContactFormProps {
  onSuccess?: (contact?: Contact) => void;
  className?: string;
  initialData?: Contact;
}

export function ContactForm({
  onSuccess,
  className,
  initialData
}: ContactFormProps) {

  const logic = useContactFormLogic({
    initialData,
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
      entityType="contact"
    >
      <ContactFormFields control={logic.form.control} />
    </SmartForm>
  );
}

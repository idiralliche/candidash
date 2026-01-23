import { FormSubmitButton } from '@/components/shared/form-submit-button';
import { Form } from '@/components/ui/form';
import { ContactFormFields } from '@/components/contacts/contact-form-fields';
import { Contact } from '@/api/model';
import { useContactFormLogic } from '@/hooks/contacts/use-contact-form-logic';

interface ContactFormProps {
  onSuccess?: (contact?: Contact) => void;
  className?: string;
  initialData?: Contact;
}

export function ContactForm({ onSuccess, className, initialData }: ContactFormProps) {
  const logic = useContactFormLogic({ initialData, onSuccess });

  return (
    <Form {...logic.form}>
      <form
        onSubmit={logic.onSubmit}
        className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}
      >
        <ContactFormFields control={logic.form.control} />

        {logic.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de l'enregistrement. Vérifiez les données.
          </div>
        )}

        <div className="sticky bottom-0">
          <FormSubmitButton
            isPending={logic.isPending}
            isEditing={logic.isEditing}
            entityType="contacte"
          />
        </div>
      </form>
    </Form>
  );
}

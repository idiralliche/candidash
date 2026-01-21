import { ContactForm } from '@/components/contacts/contact-form';
import { WizardStepGeneric } from './wizard-step-generic';
import { useDeleteContact } from '@/hooks/contacts/use-delete-contact';
import { Contact as ContactModel } from '@/api/model';
import { Users } from 'lucide-react';
import { ContactCard } from '@/components/contacts/contact-card';


interface WizardStepContactsProps {
  contacts: ContactModel[];
  onContactAdded: (contact: ContactModel) => void;
  onContactRemoved: (contactId: number) => void;
}

export function WizardStepContacts({
  contacts = [],
  onContactAdded,
  onContactRemoved
}: WizardStepContactsProps) {

  const renderContact = (
    contact: ContactModel,
    onDelete: (contact: ContactModel) => void
  ) => (
    <ContactCard
      key={contact.id}
      contact={contact}
      onDelete={() => onDelete(contact)}
    />
  );

  const config = {
    title: "Contacts",
    entityName: "Contact",
    entityNamePlural: "Contacts",
    icon: Users,
    emptyMessage: "Aucun contact ajouté pour le moment.",
    addButtonText: "Ajouter un contact",

    formComponent: ContactForm,
    deleteHook: useDeleteContact,
    getDeletePayload: (id: number) => ({ contactId: id }),
    getEntityLabel: (contact: ContactModel) => `${contact.first_name} ${contact.last_name}`,

    renderEntity: renderContact,
    onSuccess: onContactAdded,
    onRemove: onContactRemoved,
    extraProps: {}
  };

  return (
    <WizardStepGeneric<ContactModel, { contactId: number }>
      entities={contacts}
      config={config}
    />
  );
}

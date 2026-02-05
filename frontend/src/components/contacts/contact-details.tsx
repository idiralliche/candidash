import { Award } from 'lucide-react';

import { Contact } from "@/api/model";

import { Badge } from "@/components/ui/badge";
import { ContactDetailsContent } from "@/components/contacts/contact-details-content";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import { DetailsMetaInfoBlock } from "@/components/shared/details-meta-info-block";

interface ContactDetailsProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactDetails({
  contact,
  onEdit,
  onDelete,
}: ContactDetailsProps) {
  return (
    <EntityDetailsSheet
      entityName="contact"
      onDelete={() => onDelete(contact)}
    >
      <EntityDetailsSheet.Header>
        <EntityDetailsSheet.Badges>
          {contact.is_independent_recruiter && (
            <Badge
              variant="subtle"
              palette="purple"
            >
              Recruteur Indépendant
            </Badge>
          )}
        </EntityDetailsSheet.Badges>

        <EntityDetailsSheet.TitleRow
          title={`${contact.first_name} ${contact.last_name}`}
          onEdit={() => onEdit(contact)}
        />

        <EntityDetailsSheet.Metadata>
          {contact.position && (
            <DetailsMetaInfoBlock
              icon={Award}
              variant="squareBadge"
              label={contact.position}
              firstLetterCase="upperCase"
            />
          )}
        </EntityDetailsSheet.Metadata>
      </EntityDetailsSheet.Header>

      <ContactDetailsContent contact={contact} />
    </EntityDetailsSheet>
  );
}

import {
  Building2,
  Mail,
  Phone,
  Balloon,
  Link as LinkIcon,
  Contact as ContactIcon,
} from 'lucide-react';
import { IconBox } from '@/components/ui/icon-box';

import { Contact } from '@/api/model';
import { EntityCard } from '@/components/shared/entity-card';

interface ContactCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactCard({ contact, onClick, onEdit, onDelete }: ContactCardProps) {
  const company = contact.company;

  return (
    <EntityCard onClick={() => onClick(contact)}>

      {/* IDENTITY ZONE */}
      <EntityCard.Identity className="sm:w-[45%]">
        <IconBox
          palette="purple"
          shape="circle"
          groupHover
        >
          <ContactIcon className="h-5 w-5" />
        </IconBox>

        <EntityCard.Info
          title={`${contact.first_name} ${contact.last_name}`}
          subtitle={
            contact.position && (
              <p className="text-xs text-gray-400 truncate">
                {contact.position}
              </p>
            )
          }
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      <EntityCard.Meta>
        {/* Company or Status */}
        <div className="flex items-center gap-2">
          {company && (
            <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-white-subtle px-2 py-1 rounded">
              <Building2 className="h-4 w-4" />
              <span className="truncate max-w-[150px]">{company.name}</span>
            </div>
          )}
        </div>

        {/* Contact Icons */}
        <div className="hidden sm:flex items-center gap-2">
          {contact.linkedin && <LinkIcon className="h-4 w-4 text-blue-400" />}
          {contact.email && <Mail className="h-4 w-4 text-gray-500" />}
          {contact.phone && <Phone className="h-4 w-4 text-gray-500" />}
          {contact.is_independent_recruiter && <Balloon className="h-4 w-4 text-orange-400" />}
        </div>
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      <EntityCard.Actions
        onEdit={() => onEdit(contact)}
        onDelete={() => onDelete(contact)}
      />

    </EntityCard>
  );
}

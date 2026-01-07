import {
  Building2,
  Mail,
  Phone,
  Link as LinkIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IconBox } from '@/components/ui/icon-box';

import { Contact } from '@/api/model';
import { useCompanies } from '@/hooks/use-companies';
import { findEntityById } from '@/lib/utils';
import { EntityCard } from '@/components/shared/entity-card';

interface ContactCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactCard({ contact, onClick, onEdit, onDelete }: ContactCardProps) {
  const { companies } = useCompanies();
  const company = findEntityById(companies, contact.company_id);
  const initials = `${contact.first_name[0] || ''}${contact.last_name[0] || ''}`.toUpperCase();

  return (
    <EntityCard onClick={() => onClick(contact)}>

      {/* IDENTITY ZONE */}
      <EntityCard.Identity className="sm:w-[45%]">
        <IconBox
          palette="orange"
          shape="circle"
          groupHover
        >
          {initials}
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
          {company ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-white-subtle px-2 py-1 rounded">
              <Building2 className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{company.name}</span>
            </div>
          ) : contact.is_independent_recruiter ? (
            <Badge
              variant="subtle"
              palette="purple"
              className="text-[10px] font-normal"
            >
              Recruteur Indép.
            </Badge>
          ) : (
            <span className="text-xs text-gray-600 italic">Aucune liaison</span>
          )}
        </div>

        {/* Contact Icons */}
        <div className="hidden sm:flex items-center gap-2">
          {contact.linkedin && <LinkIcon className="h-3.5 w-3.5 text-blue-400" />}
          {contact.email && <Mail className="h-3.5 w-3.5 text-gray-500" />}
          {contact.phone && <Phone className="h-3.5 w-3.5 text-gray-500" />}
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

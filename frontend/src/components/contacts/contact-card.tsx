import {
  Building2,
  Mail,
  Phone,
  Balloon,
  Link as LinkIcon,
  Contact as ContactIcon,
  Award,
} from 'lucide-react';
import { Contact } from '@/api/model';
import { EntityCard } from '@/components/shared/entity-card';
import { CardInfoBlock } from '@/components/shared/card-info-block';

interface ContactCardProps {
  contact: Contact;
  onClick?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  variant?: "default" | "minimal";
  isHighlighted?: boolean;
}

export function ContactCard({
  contact,
  onClick,
  onEdit,
  onDelete,
  variant ="default",
  isHighlighted = false,
}: ContactCardProps) {
  const company = contact.company;
  const isMinimal = variant === "minimal";

  return (
    <EntityCard
      onClick={onClick && (() => onClick(contact))}
      isHighlighted={isHighlighted}
      isMinimal={isMinimal}
    >
      {/* IDENTITY ZONE */}
      <EntityCard.Identity
        iconBoxProps={{
          palette: "purple", //  isHighlighted -> palette: "blue"!
          shape:"circle",
        }}
        icon={ContactIcon}
      >
        <EntityCard.Info
          title={`${contact.first_name} ${contact.last_name}`}
          subtitle={contact.position && (
            <CardInfoBlock icon={Award}>
              {contact.position}
            </CardInfoBlock>
          )}
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Meta>
        {/* Company or Status */}
        <div className="flex justify-start min-w-0">
          {company && (
            <CardInfoBlock icon={Building2}>
              {company.name}
            </CardInfoBlock>
          )}
        </div>

        <div className="flex justify-start lg:justify-center">
          {/* TODO : Add link to opportunity */}
        </div>

        {/* Contact Icons */}
        <div className="flex justify-start lg:justify-end items-center min-w-0 gap-2">
          {contact.linkedin && <LinkIcon className="h-4 w-4 text-blue-400" />}
          {contact.email && <Mail className="h-4 w-4 text-gray-500" />}
          {contact.phone && <Phone className="h-4 w-4 text-gray-500" />}
          {contact.is_independent_recruiter && <Balloon className="h-4 w-4 text-orange-400" />}
        </div>
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(contact))}
        onDelete={onDelete && (() => onDelete(contact))}
      />
    </EntityCard>
  );
}

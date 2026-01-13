import {
  Building2,
  Mail,
  Phone,
  Link as LinkIcon,
  Trash2,
  Quote,
  FileText,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Contact } from "@/api/model";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import { DetailsBlock } from "@/components/shared/details-block";
import { ActionCard } from "@/components/shared/action-card";

interface ContactDetailsProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

export function ContactDetails({ contact, onEdit, onDelete }: ContactDetailsProps) {
  const company = contact.company;

  return (
    <EntityDetailsSheet
      title={`${contact.first_name} ${contact.last_name}`}
      subtitle={contact.position || undefined}
      badge={contact.is_independent_recruiter && (
        <Badge
          variant="subtle"
          palette="purple"
        >
          Recruteur Indépendant
        </Badge>
      )}
      metadata={company && (
        <div className="flex items-center gap-2 rounded border border-white-light bg-white-subtle px-3 py-1.5 text-primary font-bold">
          <Building2 className="h-4 w-4" />
          {company.name}
        </div>
      )}

      onEdit={onEdit ? () => onEdit(contact) : undefined}
      footer={
        onDelete && (
          <Button
            variant="ghost"
            palette="destructive"
            className="w-full"
            onClick={() => onDelete(contact)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer le contact
          </Button>
        )
      }
    >

      <Separator className="bg-white-light mb-6" />

      {/* CONTACT DETAILS GRID */}
      <div className="space-y-4 mb-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2 select-none">
          <Compass className="h-3 w-3" />
          Coordonnées
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {contact.email && (
            <ActionCard
              href={`mailto:${contact.email}`}
              icon={Mail}
              label="Email"
              value={contact.email}
            />
          )}

          {contact.phone && (
            <ActionCard
              href={`tel:${contact.phone}`}
              icon={Phone}
              label="Téléphone"
              value={contact.phone}
              valueClassName="font-mono"
            />
          )}

          {contact.linkedin && (
            <ActionCard
              href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://linkedin.com${contact.linkedin}`}
              icon={LinkIcon}
              label="LinkedIn"
              value={contact.linkedin}
              isExternal
              variant="blue"
            />
          )}
        </div>
      </div>

      <Separator className="bg-white-light mb-6" />

      {/* RELATIONSHIP NOTES */}
      {contact.relationship_notes && (
        <DetailsBlock icon={Quote} label="Contexte de rencontre">
          <div className="italic relative pl-3">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500/50 rounded-full"></div>
            {contact.relationship_notes}
          </div>
        </DetailsBlock>
      )}

      {/* GENERAL NOTES */}
      {contact.notes && (
        <DetailsBlock icon={FileText} label="Notes">
          <div className="whitespace-pre-wrap leading-relaxed">
            {contact.notes}
          </div>
        </DetailsBlock>
      )}
    </EntityDetailsSheet>
  );
}

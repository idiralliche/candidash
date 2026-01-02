import {
  Building2,
  Mail,
  Phone,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  Quote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconBox } from "@/components/ui/icon-box";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Contact } from "@/api/model";
import { useCompanies } from "@/hooks/use-companies";
import { findEntityById } from "@/lib/utils";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";

interface ContactDetailsProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

export function ContactDetails({ contact, onEdit, onDelete }: ContactDetailsProps) {
  const { companies } = useCompanies();
  const company = findEntityById(companies, contact.company_id);

  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase();

  return (
    <EntityDetailsSheet
      title={`${contact.first_name} ${contact.last_name}`}
      subtitle={contact.position || "Poste inconnu"}
      badge={
        <IconBox
          palette="orange"
          size="xl"
          shape="circle"
          border="thick"
        >
          {initials}
        </IconBox>
      }
      metadata={
        <>
          {company ? (
            <div className="flex items-center gap-2 rounded-md border border-white-light bg-white-subtle px-3 py-1.5 text-sm text-gray-200">
              <Building2 className="h-4 w-4 text-primary" />
              {company.name}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-white-subtle bg-white-subtle px-3 py-1.5 text-sm text-gray-500 italic">
              <Building2 className="h-4 w-4" />
              Aucune entreprise liée
            </div>
          )}

          {contact.is_independent_recruiter && (
            <Badge
              variant="subtle"
              palette="purple"
            >
              Recruteur Indépendant
            </Badge>
          )}
        </>
      }
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

      {/* CONTACT DETAILS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Coordonnées</h3>
        <div className="grid grid-cols-1 gap-3">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover border border-white-subtle hover:border-primary/50 transition-colors group"
            >
              <div className="p-2 rounded bg-white-subtle text-gray-400 group-hover:text-white">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-white truncate">{contact.email}</p>
              </div>
            </a>
          )}

          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover border border-white-subtle hover:border-primary/50 transition-colors group"
            >
              <div className="p-2 rounded bg-white-subtle text-gray-400 group-hover:text-white">
                <Phone className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Téléphone</p>
                <p className="text-sm text-white font-mono">{contact.phone}</p>
              </div>
            </a>
          )}

          {contact.linkedin && (
            <a
              href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://linkedin.com${contact.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover border border-white-subtle hover:border-blue-500/50 transition-colors group"
            >
              <div className="p-2 rounded bg-blue-500/10 text-blue-400 group-hover:text-blue-300">
                <LinkIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">LinkedIn</p>
                <p className="text-sm text-white truncate">{contact.linkedin}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-white" />
            </a>
          )}
        </div>
      </div>

      {/* RELATIONSHIP NOTES */}
      {contact.relationship_notes && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Quote className="h-3 w-3" />
            Contexte de rencontre
          </h3>
          <div className="text-sm text-gray-300 bg-surface-hover p-4 rounded-lg border border-white-subtle italic relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500/50 rounded-l-lg"></div>
            {contact.relationship_notes}
          </div>
        </div>
      )}

      {/* GENERAL NOTES */}
      {contact.notes && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</h3>
          <div className="text-sm text-gray-400 bg-surface-deeper p-4 rounded-lg border border-white-subtle whitespace-pre-wrap leading-relaxed">
            {contact.notes}
          </div>
        </div>
      )}
    </EntityDetailsSheet>
  );
}

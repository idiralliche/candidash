import {
  Building2,
  Mail,
  Phone,
  Link as LinkIcon,
  Quote,
  FileText,
  Compass,
} from "lucide-react";
import { Contact } from "@/api/model";
import { DetailsBlock } from "@/components/shared/details-block";
import { LinkCard } from "@/components/shared/link-card";
import { CompanyCard } from '@/components/companies/company-card';

export function ContactDetailsContent({ contact }: { contact: Contact; }) {
  const company = contact.company;

  return (
    <>
      {company?.name && (
        <DetailsBlock
          icon={Building2}
          label="Entreprise"
          variant="card"
        >
          <CompanyCard
            key={company.id}
            company={company}
            variant="minimal"
            isHighlighted
          />
        </DetailsBlock>
      )}

      {/* CONTACT DETAILS GRID */}
      {(contact.email || contact.phone || contact.linkedin) && (
        <DetailsBlock
          className="space-y-4"
          icon={Compass}
          label="Coordonnées"
          variant="list"
        >
          {contact.email && (
            <LinkCard
              href={`mailto:${contact.email}`}
              icon={Mail}
              label="Email"
              value={contact.email}
            />
          )}

          {contact.phone && (
            <LinkCard
              href={`tel:${contact.phone}`}
              icon={Phone}
              label="Téléphone"
              value={contact.phone}
              valueClassName="font-mono"
            />
          )}

          {contact.linkedin && (
            <LinkCard
              href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://linkedin.com${contact.linkedin}`}
              icon={LinkIcon}
              label="LinkedIn"
              value={contact.linkedin}
              isExternal
              variant="blue"
            />
          )}
        </DetailsBlock>
      )}

      {/* RELATIONSHIP NOTES */}
      {contact.relationship_notes && (
        <DetailsBlock
          icon={Quote}
          label="Contexte de rencontre"
        >
          {contact.relationship_notes}
        </DetailsBlock>
      )}

      {/* GENERAL NOTES */}
      {contact.notes && (
        <DetailsBlock
          icon={FileText}
          label="Notes"
        >
          {contact.notes}
        </DetailsBlock>
      )}
    </>
  );
}

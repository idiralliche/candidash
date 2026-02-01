import {
  MapPin,
  Link as LinkIcon,
  FileType,
  ChefHat,
} from "lucide-react";

import {
  LABELS_APPLICATION,
  LABELS_CONTRACT,
  getLabel,
} from "@/lib/dictionaries";
import { getApplicationTypePalette } from '@/lib/semantic-ui';

import { Opportunity } from "@/api/model";

import { Badge } from "@/components/ui/badge";
import { OpportunityDetailsContent } from "@/components/opportunities/opportunity-details-content";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import {
  DetailsMetaInfoRowContainer,
  DetailsMetaInfoBlock,
  DetailsMetaLinkButton,
} from "@/components/shared/details-meta-info-block";

interface OpportunityDetailsProps {
  opportunity: Opportunity;
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (opportunity: Opportunity) => void;
}

export function OpportunityDetails({
  opportunity,
  onEdit,
  onDelete,
}: OpportunityDetailsProps) {

  return (
    <EntityDetailsSheet
      entityName="opportunité"
      onDelete={() => onDelete(opportunity)}
    >
      <EntityDetailsSheet.Header>
        <EntityDetailsSheet.Badges>
          <Badge
            variant="subtle"
            palette={getApplicationTypePalette(opportunity.application_type)}
          >
            {getLabel(LABELS_APPLICATION, opportunity.application_type)}
          </Badge>
        </EntityDetailsSheet.Badges>

        <EntityDetailsSheet.TitleRow
          title={opportunity.job_title}
          onEdit={() => onEdit(opportunity)}
        />

        <EntityDetailsSheet.Metadata>

          <DetailsMetaInfoRowContainer>
            {opportunity.location && (
              <DetailsMetaInfoBlock
                icon={MapPin}
                label={opportunity.location}
                firstLetterCase="upperCase"
              />
            )}

            {opportunity.position_type && (
              <DetailsMetaInfoBlock
                icon={ChefHat}
                label={opportunity.position_type}
                firstLetterCase="upperCase"
              />
            )}

            {opportunity.contract_type && (
              <Badge
              variant="subtle"
              palette="gray"
              >
                <FileType className="h-3 w-3 shrink-0" />
                {getLabel(LABELS_CONTRACT, opportunity.contract_type)}
              </Badge>
            )}
          </DetailsMetaInfoRowContainer>

          {opportunity.job_posting_url && (
            <DetailsMetaLinkButton
              href={opportunity.job_posting_url}
              icon={LinkIcon}
              label="Voir l'annonce originale"
            />
          )}

        </EntityDetailsSheet.Metadata>
      </EntityDetailsSheet.Header>

      <OpportunityDetailsContent opportunity={opportunity} />
    </EntityDetailsSheet>
  );
}

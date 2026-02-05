import {
  Briefcase,
  Building2,
  Users,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EntityCard } from "@/components/shared/entity-card";
import { CardInfoBlock } from '@/components/shared/card-info-block';
import { Opportunity } from "@/api/model";
import {
  LABELS_APPLICATION,
  getLabel,
} from "@/lib/dictionaries";
import { getApplicationTypePalette } from '@/lib/semantic-ui';
import { OpportunitiesContactsList } from '@/components/opportunities-contacts/opportunities-contacts-list';
import { Button } from "@/components/ui/button";

export interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick?: (opportunity: Opportunity) => void;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
  variant?: "default" | "compact" | "minimal";
  isHighlighted?: boolean;
}

export function OpportunityCard({
  opportunity,
  onClick,
  onEdit,
  onDelete,
  variant ="default",
  isHighlighted = false,
}: OpportunityCardProps) {
  const company = opportunity.company;
  const isCompact = variant === "compact";
  const isMinimal = variant === "minimal";
  const trigger = (
    <Button
      variant="outline"
      palette={isHighlighted ? "blue" : "gray"}
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white-subtle"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Users className="h-4 w-4" />
    </Button>
  );

  return (
    <EntityCard
      onClick={onClick && (() => onClick(opportunity))}
      isHighlighted={isHighlighted}
      isMinimal={isMinimal}
    >
      {/* IDENTITY ZONE */}
      <EntityCard.Identity
        iconBoxProps={{ palette: "emerald" }} // isHighlighted -> palette: "blue"!
        icon={Briefcase}
      >
        <EntityCard.Info
          title={opportunity.job_title}
          subtitle={company && (
            <CardInfoBlock icon={Building2}>
              {company.name}
            </CardInfoBlock>
          )}
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Meta>
        {/* Location */}
        <div className="flex justify-start min-w-0">
          {!isCompact && opportunity.location && (
            <CardInfoBlock icon={MapPin}>
              {opportunity.location}
            </CardInfoBlock>
          )}
        </div>

        {/* Application Type Badge */}
        <div className={`${!isCompact ? "flex justify-start lg:justify-center" : ""}`}>
          <Badge
            variant="subtle"
            palette={getApplicationTypePalette(opportunity.application_type)}
          >
            {getLabel(
              LABELS_APPLICATION, opportunity.application_type
            ).split(/\s+/)[0]} {/* Offre | Candidature | Contacté */}
          </Badge>
        </div>

        <div className="flex justify-start lg:justify-end items-center min-w-0 gap-2">
          {/* TODO : Add link to main contact */}
        </div>
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      {/*null if variant === "minimal" & not onEdit & not onDelete */}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(opportunity))}
        onDelete={onDelete && (() => onDelete(opportunity))}
      >
        {!isMinimal && (
          <OpportunitiesContactsList
            opportunityId={opportunity.id}
            integrationContext="card"
            trigger={trigger}
          />
        )}
      </EntityCard.Actions>
    </EntityCard>
  );
}

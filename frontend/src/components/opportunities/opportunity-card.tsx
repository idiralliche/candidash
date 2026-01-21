import {
  Briefcase,
  Building2,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IconBox } from "@/components/ui/icon-box";
import { EntityCard } from "@/components/shared/entity-card";
import { Opportunity } from "@/api/model";
import {
  LABELS_APPLICATION,
  getLabel,
} from "@/lib/dictionaries";
import { getApplicationTypePalette } from '@/lib/semantic-ui';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick?: (opportunity: Opportunity) => void;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
}

export function OpportunityCard({
  opportunity,
  onClick,
  onEdit,
  onDelete,
}: OpportunityCardProps) {
  const company = opportunity.company;

  return (
    <EntityCard
      onClick={onClick && (() => onClick(opportunity))}
      className={onClick ? "cursor-pointer" : "cursor-default"}
    >

      {/* IDENTITY ZONE */}
      <EntityCard.Identity className="sm:w-[45%]">
        <IconBox
          palette="emerald"
          groupHover
        >
          <Briefcase className="h-5 w-5" />
        </IconBox>

        <EntityCard.Info
          title={opportunity.job_title}
          subtitle={company && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Building2 className="h-3 w-3" />
              <span className="truncate">
                {company.name}
              </span>
            </div>
          )}
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      <EntityCard.Meta>
        {/* Application Type Badge */}
        <Badge
          variant="subtle"
          palette={getApplicationTypePalette(opportunity.application_type)}
        >
          {getLabel(LABELS_APPLICATION, opportunity.application_type)}
        </Badge>

        {/* Location */}
        {opportunity.location ? (
          <div className="flex items-center gap-2 truncate text-xs sm:mx-auto">
            <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            <span className="truncate max-w-[150px]">
              {opportunity.location}
            </span>
          </div>
        ) : (
          <div className="hidden sm:block sm:mx-auto" />
        )}
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(opportunity))}
        onDelete={onDelete && (() => onDelete(opportunity))}
      />

    </EntityCard>
  );
}

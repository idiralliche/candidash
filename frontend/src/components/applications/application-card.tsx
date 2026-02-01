import { format } from 'date-fns';
import {
  Layers,
  Archive,
  Rocket,
} from "lucide-react";
import { Application } from "@/api/model";
import { EntityCard } from "@/components/shared/entity-card";
import { CardInfoBlock } from '@/components/shared/card-info-block';
import { Badge } from "@/components/ui/badge";
import {
  LABELS_APPLICATION_STATUS,
  getLabel,
} from '@/lib/dictionaries';
import { getApplicationStatusPalette } from '@/lib/semantic-ui';

interface ApplicationCardProps {
  application: Application;
  onClick?: (app: Application) => void;
  onEdit?: (app: Application) => void;
  onDelete?: (app: Application) => void;
  variant?: "default" | "minimal";
  isHighlighted?: boolean;
}

export function ApplicationCard({
  application,
  onClick,
  onEdit,
  onDelete,
  variant ="default",
  isHighlighted = false,
}: ApplicationCardProps) {
  const applicationDate = new Date(application.application_date);
  const opportunity = application.opportunity;
  const isMinimal = variant === "minimal";

  return (
    <EntityCard
      onClick={onClick && (() => onClick(application))}
      isHighlighted={isHighlighted}
      isMinimal={isMinimal}
    >
      <EntityCard.Identity
        iconBoxProps={{ palette: "orange" }} //  isHighlighted -> palette: "blue"!
        icon={Layers}
      >
        <EntityCard.Info
          title={opportunity?.job_title || "Opportunité inconnue"}
          subtitle={
            <CardInfoBlock icon={Rocket}>
              {format(applicationDate, 'dd/MM/yyyy')}
            </CardInfoBlock>
          }
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Meta>
        <div className="flex justify-start min-w-0 items-center gap-2">
          {application.is_archived && (
            <Badge
              variant="subtle"
              palette="yellow"
            >
              <Archive className="h-3 w-3" />
              Archivée
            </Badge>
          )}
        </div>

        <div className="flex justify-start lg:justify-end min-w-0">
          <Badge
            variant="subtle"
            palette={getApplicationStatusPalette(application.status)}
          >
            {getLabel(LABELS_APPLICATION_STATUS, application.status)}
          </Badge>
        </div>
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(application))}
        onDelete={onDelete && (() => onDelete(application))}
      />
    </EntityCard>
  );
}

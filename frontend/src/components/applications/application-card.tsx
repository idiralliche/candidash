import { format } from 'date-fns';
import {
  Layers,
  Archive,
} from "lucide-react";
import { Application } from "@/api/model";
import { EntityCard } from "@/components/shared/entity-card";
import { IconBox } from "@/components/ui/icon-box";
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
}

export function ApplicationCard({
  application,
  onClick,
  onEdit,
  onDelete
}: ApplicationCardProps) {
  const applicationDate = new Date(application.application_date);
  const opportunity = application.opportunity;

  return (
    <EntityCard
      onClick={onClick && (() => onClick(application))}
      className={onClick ? "cursor-pointer" : "cursor-default"}
    >
      <EntityCard.Identity>
        <IconBox palette="orange" groupHover>
          <Layers className="h-5 w-5" />
        </IconBox>
        <EntityCard.Info
          title={opportunity?.job_title || "Opportunité inconnue"}
          subtitle={
            <p className="text-xs text-gray-400">
              {format(applicationDate, 'dd/MM/yyyy')}
            </p>
          }
        />
      </EntityCard.Identity>

      <EntityCard.Meta>
        <div className="flex justify-start min-w-0 items-center gap-2">
          {application.is_archived && (
            <Badge
              variant="subtle"
              palette="yellow"
            >
              <Archive className="mr-2 h-3 w-3" />
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
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(application))}
        onDelete={onDelete && (() => onDelete(application))}
      />
    </EntityCard>
  );
}

import {
  Target,
  CheckCircle2,
  Circle,
  Calendar,
} from 'lucide-react';

import { Action } from '@/api/model';
import { EntityCard } from '@/components/shared/entity-card';
import { IconBox } from '@/components/ui/icon-box';
import { Badge } from '@/components/ui/badge';

interface ActionCardProps {
  action: Action;
  onClick?: (action: Action) => void;
  onEdit?: (action: Action) => void;
  onDelete?: (action: Action) => void;
}

export function ActionCard({
  action,
  onClick,
  onEdit,
  onDelete,
}: ActionCardProps) {
  const isCompleted = !!action.completed_date;
  const application = action.application;
  const opportunity = application?.opportunity;
  const scheduled_event = action.scheduled_event;

  return (
    <EntityCard
      onClick={onClick && (() => onClick(action))}
      className={onClick ? "cursor-pointer" : "cursor-default"}
    >
      <EntityCard.Identity>
        <IconBox
          palette={isCompleted ? 'green' : 'blue'}
          groupHover
        >
          <Target className="h-5 w-5" />
        </IconBox>
        <EntityCard.Info
          title={action.type}
          subtitle={
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400">
                {opportunity?.job_title || "Candidature inconnue"}
              </span>
            </div>
          }
        />
      </EntityCard.Identity>

      <EntityCard.Meta>
        <div className="flex justify-start min-w-0 items-center gap-2">
          {scheduled_event && (
            <>
              <Calendar className="w-3.5 h-3.5" />
              <span className="truncate">
                {scheduled_event.title}
              </span>
            </>
          )}
        </div>

        <div className="flex justify-start lg:justify-center min-w-0">
          <Badge
            variant={isCompleted ? "subtle" : "solid"}
            palette={isCompleted ? "green" : "blue"}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                Terminée
              </>
            ) : (
              <>
                <Circle className="mr-2 h-3.5 w-3.5" />
                À faire
              </>
            )}
          </Badge>
        </div>
      </EntityCard.Meta>

      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(action))}
        onDelete={onDelete && (() => onDelete(action))}
      />
    </EntityCard>
  );
}

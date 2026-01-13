import {
  Target,
  CheckCircle2,
  Circle,
} from 'lucide-react';

import { Action } from '@/api/model';
import { EntityCard } from '@/components/shared/entity-card';
import { IconBox } from '@/components/ui/icon-box';
import { Badge } from '@/components/ui/badge';

interface ActionCardProps {
  action: Action;
  onClick: (action: Action) => void;
  onEdit: (action: Action) => void;
  onDelete: (action: Action) => void;
}

export function ActionCard({
  action,
  onClick,
  onEdit,
  onDelete
}: ActionCardProps) {
  const isCompleted = !!action.completed_date;
  const application = action.application;
  const opportunity = application?.opportunity;

  return (
    <EntityCard onClick={() => onClick(action)}>
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
        <Badge
          variant={isCompleted ? "subtle" : "solid"}
          palette={isCompleted ? "green" : "blue"}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="mr-1.5 h-3 w-3" />
              Terminée
            </>
          ) : (
            <>
              <Circle className="mr-1.5 h-3 w-3" />
              À faire
            </>
          )}
        </Badge>
      </EntityCard.Meta>

      <EntityCard.Actions
        onEdit={() => onEdit(action)}
        onDelete={() => onDelete(action)}
      />
    </EntityCard>
  );
}

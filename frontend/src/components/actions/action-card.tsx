import {
  Target,
  CheckCircle2,
  Circle,
  Calendar,
  Layers
} from 'lucide-react';

import { Action } from '@/api/model';
import { EntityCard } from '@/components/shared/entity-card';
import { CardInfoBlock } from '@/components/shared/card-info-block';
import { Badge } from '@/components/ui/badge';

interface ActionCardProps {
  action: Action;
  onClick?: (action: Action) => void;
  onEdit?: (action: Action) => void;
  onDelete?: (action: Action) => void;
  variant?: "default" | "minimal";
  isHighlighted?: boolean;
}

export function ActionCard({
  action,
  onClick,
  onEdit,
  onDelete,
  variant ="default",
  isHighlighted = false,
}: ActionCardProps) {
  const isCompleted = !!action.completed_date;
  const application = action.application;
  const opportunity = application?.opportunity;
  const scheduled_event = action.scheduled_event;

  return (
    <EntityCard
      onClick={onClick && (() => onClick(action))}
      isHighlighted={isHighlighted}
      isMinimal={variant === "minimal"}
    >
      <EntityCard.Identity
        iconBoxProps={{ palette: "green" }} // isHighlighted -> palette: "blue"!
        icon={Target}
      >
        <EntityCard.Info
          title={action.type}
          subtitle={opportunity && (
            <CardInfoBlock icon={Layers}>
              {opportunity.job_title}
            </CardInfoBlock>
          )}
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Meta>
        <div className="flex justify-start min-w-0">
          {scheduled_event && (
            <CardInfoBlock icon={Calendar}>
              {scheduled_event.title}
            </CardInfoBlock>
          )}
        </div>

        <div className="flex justify-start lg:justify-center min-w-0">
          <Badge
            variant={isCompleted ? "subtle" : "solid"}
            palette={isCompleted ? "green" : "blue"}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Terminée
              </>
            ) : (
              <>
                <Circle className="h-3 w-3" />
                À faire
              </>
            )}
          </Badge>
        </div>
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(action))}
        onDelete={onDelete && (() => onDelete(action))}
      />
    </EntityCard>
  );
}

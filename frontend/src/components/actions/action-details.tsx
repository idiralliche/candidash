import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  Clock,
  Calendar,
  Check
} from 'lucide-react';

import { Action } from '@/api/model';

import { Badge } from '@/components/ui/badge';
import { ActionDetailsContent } from '@/components/actions/action-details-content';
import { EntityDetailsSheet } from '@/components/shared/entity-details-sheet';
import { DetailsMetaInfoBlock } from "@/components/shared/details-meta-info-block";

interface ActionDetailsProps {
  action: Action;
  onEdit: (action: Action) => void;
  onDelete: (action: Action) => void;
}

export function ActionDetails({
  action,
  onEdit,
  onDelete,
}: ActionDetailsProps) {
  const isCompleted = !!action.completed_date;
  const createdDate = new Date(action.created_at);

  return (
    <EntityDetailsSheet
      entityName="action"
      onDelete={() => onDelete(action)}
    >
      <EntityDetailsSheet.Header>
        <EntityDetailsSheet.Badges>
          <Badge
            variant={isCompleted ? 'subtle' : 'solid'}
            palette={isCompleted ? 'green' : 'blue'}
          >
            {isCompleted ? (
              <>
                <Check className="h-3 w-3" />
                Terminée
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                À faire
              </>
            )}
          </Badge>
        </EntityDetailsSheet.Badges>

        <EntityDetailsSheet.TitleRow
          title={action.type}
          onEdit={() => onEdit(action)}
        />

        <EntityDetailsSheet.Metadata>
          <DetailsMetaInfoBlock
            icon={Calendar}
            label={`Créée le ${format(createdDate, 'dd MMMM yyyy', { locale: fr })}`}
          />
        </EntityDetailsSheet.Metadata>
      </EntityDetailsSheet.Header>

      <ActionDetailsContent
        action={action}
        isCompleted={isCompleted}
      />
    </EntityDetailsSheet>
  );
}

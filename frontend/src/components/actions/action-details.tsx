import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Target,
  CheckCircle2,
  Trash2,
  Calendar,
  FileText,
  Layers,
  CalendarClock,
  Circle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Action } from '@/api/model';
import { EntityDetailsSheet } from '@/components/shared/entity-details-sheet';
import { DetailsBlock } from '@/components/shared/details-block';
import { LinkCard } from '@/components/shared/link-card';

interface ActionDetailsProps {
  action: Action;
  onEdit?: (action: Action) => void;
  onDelete?: (action: Action) => void;
}

export function ActionDetails({ action, onEdit, onDelete }: ActionDetailsProps) {
  const isCompleted = !!action.completed_date;
  const createdDate = new Date(action.created_at);
  const application = action.application;
  const scheduledEvent = action.scheduled_event;

  return (
    <EntityDetailsSheet
      title={action.type}
      badge={
        <Badge
          variant={isCompleted ? 'subtle' : 'solid'}
          palette={isCompleted ? 'green' : 'blue'}
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
      }
      metadata={
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Calendar className="h-4 w-4" />
          Créée le {format(createdDate, 'dd MMMM yyyy', { locale: fr })}
        </div>
      }
      onEdit={onEdit ? () => onEdit(action) : undefined}
      footer={
        onDelete && (
          <Button
            variant="ghost"
            palette="destructive"
            className="w-full"
            onClick={() => onDelete(action)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer l'action
          </Button>
        )
      }
    >
      {/* SECTION CONTEXTE */}
      {(application || scheduledEvent) && (
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2 select-none">
            <Target className="h-3 w-3" />
            Contexte
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {application && (
              <LinkCard
                icon={Layers}
                label="Candidature liée"
                value={application.opportunity?.job_title || "Voir la candidature"}
                variant="default"
              />
            )}

            {scheduledEvent && (
              <LinkCard
                icon={CalendarClock}
                label="Événement lié"
                value={`${scheduledEvent.title} (${format(new Date(scheduledEvent.scheduled_date), 'dd/MM/yyyy')})`}
                variant="blue"
              />
            )}
          </div>

          <Separator className="bg-white-light mt-6" />
        </div>
      )}

      {/* SECTION DETAILS */}
      <div className="space-y-6">
        {isCompleted && action.completed_date && (
          <DetailsBlock
            icon={CheckCircle2}
            label="Date de réalisation"
          >
            {format(new Date(action.completed_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
          </DetailsBlock>
        )}

        {action.notes && (
          <DetailsBlock
            icon={FileText}
            label="Notes & Commentaires"
          >
            <div className="whitespace-pre-wrap leading-relaxed text-sm">
              {action.notes}
            </div>
          </DetailsBlock>
        )}
      </div>
    </EntityDetailsSheet>
  );
}

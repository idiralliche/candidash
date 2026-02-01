import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CalendarCheck,
  FileText,
  Layers,
  CalendarClock,
} from 'lucide-react';

import { Action } from '@/api/model';
import { DetailsBlock } from '@/components/shared/details-block';
import { ApplicationCard } from '@/components/applications/application-card';
import { EventCard } from '@/components/events/event-card';

export function ActionDetailsContent({
  action,
  isCompleted = false,
} : {
  action: Action;
  isCompleted: boolean;
}) {
  const application = action.application;
  const scheduledEvent = action.scheduled_event;

  return (
    <>
      {isCompleted && (
        <DetailsBlock
          icon={CalendarCheck}
          label="Date de réalisation"
          itemsClassName="border-green-500/10 bg-green-500/5 text-green-300"
        >
          {format(
            new Date(action.completed_date!), // isCompleted is only true if completed_date is defined
            'dd MMMM yyyy à HH:mm',
            { locale: fr}
          )}
        </DetailsBlock>
      )}

      {application && (
        <DetailsBlock
          icon={Layers}
          label="Candidature"
          variant="card"
        >
          <ApplicationCard
            key={application.id}
            application={application}
            variant="minimal"
            isHighlighted
          />
        </DetailsBlock>
      )}

      {scheduledEvent && (
        <DetailsBlock
          icon={CalendarClock}
          label="Événement Programmé"
          variant="card"
        >
          <EventCard
            key={scheduledEvent.id}
            event={scheduledEvent}
            variant="minimal"
          />
        </DetailsBlock>
      )}

      {!!action.notes && (
        <DetailsBlock
          icon={FileText}
          label="Notes & Commentaires"
        >
          {action.notes}
        </DetailsBlock>
      )}
    </>
  );
}

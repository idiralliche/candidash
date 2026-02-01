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
import { BasicDetails } from '@/components/shared/basic-details';
import { DetailsEntityCard } from '@/components/shared/details-entity-card';

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
        >
          <BasicDetails className="border-green-500/10 bg-green-500/5 text-green-300" >
            {format(
              new Date(action.completed_date!), // isCompleted is only true if completed_date is defined
              'dd MMMM yyyy à HH:mm',
              { locale: fr}
            )}
          </BasicDetails>
        </DetailsBlock>
      )}

      {application && (
        <DetailsBlock
          icon={Layers}
          label="Candidature"
        >
          <DetailsEntityCard>
            <ApplicationCard
              key={application.id}
              application={application}
              variant="minimal"
              isHighlighted
            />
          </DetailsEntityCard>
        </DetailsBlock>
      )}

      {scheduledEvent && (
        <DetailsBlock
          icon={CalendarClock}
          label="Événement Programmé"
        >
          <DetailsEntityCard>
            <EventCard
              key={scheduledEvent.id}
              event={scheduledEvent}
              variant="minimal"
            />
          </DetailsEntityCard>
        </DetailsBlock>
      )}

      {!!action.notes && (
        <DetailsBlock
          icon={FileText}
          label="Notes & Commentaires"
        >
          <BasicDetails>
            {action.notes}
          </BasicDetails>
        </DetailsBlock>
      )}
    </>
  );
}

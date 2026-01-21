import { Calendar } from 'lucide-react';
import { EventForm } from '@/components/events/event-form';
import { useDeleteScheduledEvent } from '@/hooks/scheduled-events/use-delete-scheduled-event';
import { WizardStepGeneric } from './wizard-step-generic';
import { ScheduledEvent } from '@/api/model';
import { EventCard } from '@/components/events/event-card';

interface WizardStepScheduledEventsProps {
  events: ScheduledEvent[];
  onEventAdded: (event: ScheduledEvent) => void;
  onEventRemoved: (eventId: number) => void;
}

export function WizardStepScheduledEvents({
  events = [],
  onEventAdded,
  onEventRemoved
}: WizardStepScheduledEventsProps) {

  const renderEvent = (
    event: ScheduledEvent,
    onDelete: (event: ScheduledEvent) => void
  ) => (
    <EventCard
      key={event.id}
      event={event}
      onDelete={() => onDelete(event)}
    />
  );

  const config = {
    title: "Événements",
    entityName: "Événement",
    entityNamePlural: "Événements",
    icon: Calendar,
    emptyMessage: "Aucun événement planifié. Notez vos entretiens, appels ou dates butoirs.",
    addButtonText: "Planifier un événement",

    formComponent: EventForm,
    deleteHook: useDeleteScheduledEvent,
    getDeletePayload: (id: number) => ({ eventId: id }),
    getEntityLabel: (event: ScheduledEvent) => event.title,

    renderEntity: renderEvent,
    onSuccess: onEventAdded,
    onRemove: onEventRemoved,
    extraProps: {}
  };

  return (
    <WizardStepGeneric<ScheduledEvent, { eventId: number }>
      entities={events}
      config={config}
    />
  );
}

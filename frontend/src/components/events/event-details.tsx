import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Mail,
  Podcast,
  CalendarCog,
  LucideIcon,
} from "lucide-react";

import {
  LABELS_EVENT_STATUS,
  LABELS_COMMUNICATION_METHOD,
  getLabel,
} from "@/lib/dictionaries";
import { getEventStatusPalette } from '@/lib/semantic-ui';

import { ScheduledEvent } from "@/api/model";

import { Badge } from "@/components/ui/badge";
import { EventDetailsContent } from "@/components/events/event-details-content";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import {
  DetailsMetaInfoBlock,
  DetailsMetaInfoRowContainer,
} from "@/components/shared/details-meta-info-block";

interface EventDetailsProps {
  event: ScheduledEvent;
  onEdit: (event: ScheduledEvent) => void;
  onDelete: (event: ScheduledEvent) => void;
}

export function EventDetails({
  event,
  onEdit,
  onDelete
}: EventDetailsProps) {

  // Helper to get icon based on communication method
  const getMethodIcon = (method?: string) : LucideIcon => {
    switch (method) {
      case 'video': return Video;
      case 'phone': return Phone;
      case 'in_person': return MapPin;
      case 'email': return Mail;
      default: return Podcast;
    }
  };

  return (
    <EntityDetailsSheet
      entityName="événement"
      onDelete={() => onDelete(event)}
    >
      <EntityDetailsSheet.Header>
        <EntityDetailsSheet.Badges>
          <Badge
            variant="subtle"
            palette={getEventStatusPalette(event.status)}
          >
            {getLabel(LABELS_EVENT_STATUS, event.status)}
          </Badge>
        </EntityDetailsSheet.Badges>

        <EntityDetailsSheet.TitleRow
          title={event.title}
          onEdit={() => onEdit(event)}
        />

        <EntityDetailsSheet.Metadata>

          {event.event_type && (
            <DetailsMetaInfoBlock
              icon={CalendarCog}
              label= {event.event_type}
            />
          )}

          <DetailsMetaInfoRowContainer>
            {/* Date */}
            <DetailsMetaInfoBlock
              icon={Calendar}
              variant="squareBadge"
              label={format(new Date(event.scheduled_date), "EEEE dd/MM/yyyy", { locale: fr })}
              firstLetterCase="upperCase"
            />

            {/* Time & Duration */}
            <DetailsMetaInfoBlock
              icon={Clock}
              variant="squareBadge"
              label={`${format(new Date(event.scheduled_date), "HH:mm")} (${event.duration_minutes} min)`}
              firstLetterCase="upperCase"
            />

            {/* Communication Method */}
            {event.communication_method && (
              <DetailsMetaInfoBlock
                icon={getMethodIcon(event.communication_method)}
                variant="squareBadge"
                label={getLabel(LABELS_COMMUNICATION_METHOD, event.communication_method)}
                firstLetterCase="upperCase"
              />
            )}
          </DetailsMetaInfoRowContainer>

        </EntityDetailsSheet.Metadata>
      </EntityDetailsSheet.Header>

      <EventDetailsContent event={event} />
    </EntityDetailsSheet>
  );
}

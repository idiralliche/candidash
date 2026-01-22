import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Clock,
  MapPin,
  Video,
  Phone,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { EntityCard } from '@/components/shared/entity-card';

import { ScheduledEvent } from '@/api/model';
import {
  LABELS_EVENT_STATUS,
  getLabel,
} from '@/lib/dictionaries';
import { getEventStatusPalette } from '@/lib/semantic-ui';

interface EventCardProps {
  event: ScheduledEvent;
  onClick?: (event: ScheduledEvent) => void;
  onEdit?: (event: ScheduledEvent) => void;
  onDelete?: (event: ScheduledEvent) => void;
}

export function EventCard({
  event,
  onClick,
  onEdit,
  onDelete
}: EventCardProps) {
  const date = new Date(event.scheduled_date);

  const getIconForMethod = (method?: string) => {
    switch (method) {
      case 'video': return <Video className="h-3 w-3" />;
      case 'phone': return <Phone className="h-3 w-3" />;
      case 'in_person': return <MapPin className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <EntityCard
      onClick={onClick && (() => onClick(event))}
      hoverPalette="blue"
      className={onClick ? "cursor-pointer" : "cursor-default"}
    >

      {/* IDENTITY: Date Box as Icon + Title */}
      <EntityCard.Identity>
        {/* Date Box (Custom Icon Placeholder) */}
        <div className="flex flex-col items-center justify-center h-12 w-12 shrink-0 rounded-lg bg-surface-elevated border border-white-subtle text-white">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none">
            {format(date, 'MMM', { locale: fr })}
          </span>
          <span className="text-lg font-bold leading-none mt-0.5">
            {format(date, 'dd')}
          </span>
        </div>

        <EntityCard.Info
          title={event.title}
          hoverPalette="blue"
          subtitle={event.event_type && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="truncate">{event.event_type}</span>
            </div>
          )}
        />
      </EntityCard.Identity>

      {/* META: Status & Time */}
      <EntityCard.Meta>
        <div className="flex justify-start min-w-0 items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-gray-500" />
          <span>{format(date, 'HH:mm')}</span>
          {event.duration_minutes && (
            <span>• {event.duration_minutes} min</span>
          )}
        </div>

        <div className="flex justify-start lg:justify-center">
            <Badge
              variant="subtle"
              palette={getEventStatusPalette(event.status)}
              className="text-[10px] px-2 py-0.5 h-5"
            >
                {getLabel(LABELS_EVENT_STATUS, event.status)}
            </Badge>
        </div>

        <div className="flex justify-start lg:justify-end items-center min-w-0 gap-2">
          {event.communication_method && (
            <div className="flex items-center gap-2 text-xs text-gray-300 bg-white-subtle px-2 py-1 rounded">
              {getIconForMethod(event.communication_method)}
              <span className="capitalize">{event.communication_method.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(event))}
        onDelete={onDelete && (() => onDelete(event))}
      />
    </EntityCard>
  );
}

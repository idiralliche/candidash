import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Clock,
  MapPin,
  Video,
  Phone,
  Mail,
  CalendarCog,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { EntityCard } from '@/components/shared/entity-card';
import { CardInfoBlock } from '@/components/shared/card-info-block';

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
  variant?: "default" | "minimal";
  isHighlighted?: boolean;
}

export function EventCard({
  event,
  onClick,
  onEdit,
  onDelete,
  variant = "default",
  isHighlighted = false,
}: EventCardProps) {
  const date = new Date(event.scheduled_date);
  const isMinimal = variant === "minimal";

  const getIconForMethod = (method?: string) => {
    switch (method) {
      case 'video': return <Video className="h-3 w-3" />;
      case 'phone': return <Phone className="h-3 w-3" />;
      case 'in_person': return <MapPin className="h-3 w-3" />;
      case 'email': return <Mail className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <EntityCard
      onClick={onClick && (() => onClick(event))}
      hoverPalette="blue"
      isHighlighted={isHighlighted}
      isMinimal={isMinimal}
    >
      {/* IDENTITY: Date Box as Icon + Title */}
      <EntityCard.Identity
        iconBoxProps={{
          className:"flex-col !bg-[#1a2334] !opacity-100",
          palette: "blue",
          size:"lg",
        }}
        icon={
          <>
            {/* Date Box (Custom Icon Placeholder) */}
            <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider leading-none">
              {format(date, 'MMM', { locale: fr })}
            </span>
            <span className="text-lg font-bold leading-none text-blue-300 mt-0.5">
              {format(date, 'dd')}
            </span>
          </>
        }
      >
        <EntityCard.Info
          title={event.title}
          subtitle={event.event_type && (
            <CardInfoBlock icon={CalendarCog}>
              {event.event_type}
            </CardInfoBlock>
          )}
        />
      </EntityCard.Identity>

      {/* META: Status & Time */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Meta>
        <div className="flex justify-start min-w-0">
          <CardInfoBlock icon={Clock}>
            {format(date, 'HH:mm')}{event.duration_minutes && (` • ${event.duration_minutes} min`)}
          </CardInfoBlock>
        </div>

        <div className="flex justify-start lg:justify-center">
            <Badge
              variant="subtle"
              palette={getEventStatusPalette(event.status)}
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
      {/*null if variant === "minimal"*/}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(event))}
        onDelete={onDelete && (() => onDelete(event))}
      />
    </EntityCard>
  );
}

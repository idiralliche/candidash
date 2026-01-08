import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Video,
  Phone,
  Info,
  Mail,
  Podcast,
  FileText,
  Link as LinkIcon,
  Navigation,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScheduledEvent } from "@/api/model";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import { DetailsBlock } from "@/components/shared/details-block";
import { ActionCard } from "@/components/shared/action-card";
import {
  LABELS_EVENT_STATUS,
  LABELS_COMMUNICATION_METHOD,
  getLabel,
} from "@/lib/dictionaries";

import { getStatusPalette } from '@/lib/semantic-ui';

interface EventDetailsProps {
  event: ScheduledEvent;
  onEdit?: (event: ScheduledEvent) => void;
  onDelete?: (event: ScheduledEvent) => void;
}

export function EventDetails({ event, onEdit, onDelete }: EventDetailsProps) {

  // Helper to get icon based on communication method
  const getMethodIcon = (method?: string) => {
    switch (method) {
      case 'video': return <Video className="h-4 w-4 text-primary" />;
      case 'phone': return <Phone className="h-4 w-4 text-primary" />;
      case 'in_person': return <MapPin className="h-4 w-4 text-primary" />;
      case 'email': return <Mail className="h-4 w-4 text-primary" />;
      default: return <Podcast className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <EntityDetailsSheet
      title={event.title}
      badge={
        <Badge
          variant="subtle"
          palette={getStatusPalette(event.status)}
        >
          {getLabel(LABELS_EVENT_STATUS, event.status)}
        </Badge>
      }
      subtitle={event.event_type || undefined}
      onEdit={onEdit ? () => onEdit(event) : undefined}
      footer={
        onDelete && (
          <Button
            variant="ghost"
            palette="destructive"
            className="w-full"
            onClick={() => onDelete(event)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer l'événement
          </Button>
        )
      }
    >
      <Separator className="bg-white-light mb-6" />

      {/* DATE, TIME & COMMUNICATION METHOD */}
     <div className="flex flex-wrap gap-2 text-sm text-muted-foreground pt-1 w-full mb-6">
        {/* Date */}
        <div className="flex items-center gap-2 rounded border border-white-light bg-white-subtle px-3 py-1.5 text-gray-300 font-bold">
          <Calendar className="h-4 w-4 text-primary" />
          {format(new Date(event.scheduled_date), "EEEE dd/MM/yyyy", { locale: fr })}
        </div>

        {/* Time & Duration */}
        <div className="flex items-center gap-2 rounded border border-white-light bg-white-subtle px-3 py-1.5 text-gray-300 font-bold">
          <Clock className="h-4 w-4 text-primary" />
          {format(new Date(event.scheduled_date), "HH:mm")}
          {event.duration_minutes && (
            <span className="text-muted-foreground ml-1">({event.duration_minutes} min)</span>
          )}
        </div>

        {/* Communication Method */}
        {event.communication_method && (
          <div className="flex items-center gap-2 rounded border border-white-light bg-white-subtle px-3 py-1.5 text-gray-300 font-bold">
            {getMethodIcon(event.communication_method)}
            {getLabel(LABELS_COMMUNICATION_METHOD, event.communication_method)}
          </div>
        )}
      </div>

      {/* CONNECTION DETAILS */}
      {(event.event_link || event.phone_number) && (
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
            <Info className="h-3 w-3" />
            Détails de connexion
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {/* Link */}
            {event.event_link && (
              <ActionCard
                href={event.event_link}
                icon={LinkIcon}
                label="Lien Visio"
                value={event.event_link}
                isExternal
                variant="blue"
              />
            )}

            {/* Phone */}
            {event.phone_number && (
              <ActionCard
                href={`tel:${event.phone_number}`}
                icon={Phone}
                label="Téléphone"
                value={event.phone_number}
                valueClassName="font-mono"
              />
            )}
          </div>
        </div>
      )}

      {/* Location */}
      {event.location && (
        <DetailsBlock icon={MapPin} label="Adresse / Lieu">
          {event.location}
        </DetailsBlock>
      )}

      {/* INSTRUCTIONS */}
      {event.instructions && (
        <DetailsBlock icon={Navigation} label="Instructions">
          {event.instructions}
        </DetailsBlock>
      )}

      {/* PERSONAL NOTES */}
      {event.notes && (
        <DetailsBlock icon={FileText} label="Notes Personnelles">
          <div className="whitespace-pre-wrap leading-relaxed">
            {event.notes}
          </div>
        </DetailsBlock>
      )}
    </EntityDetailsSheet>
  );
}

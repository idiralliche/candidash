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
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScheduledEvent } from "@/api/model";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
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
      case 'video': return <Video className="h-3 w-3" />;
      case 'phone': return <Phone className="h-3 w-3" />;
      case 'in_person': return <MapPin className="h-3 w-3" />;
      case 'email': return <Mail className="h-3 w-3" />;
      default: return <Podcast className="h-3 w-3" />;
    }
  };

  return (
    <EntityDetailsSheet
      title={event.title}
      badge={
        <div className="flex gap-2 mb-2">
            {/* Status Badge */}
            <Badge
              variant="subtle"
              palette={getStatusPalette(event.status)}
            >
              {getLabel(LABELS_EVENT_STATUS, event.status)}
            </Badge>

            {/* Type Badge */}
            {event.event_type && (
              <Badge
                variant="subtle"
                palette="gray"
                className="border-none"
              >
                {event.event_type}
              </Badge>
            )}
        </div>
      }
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

      {/* 1. GRID DATE & TIME */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* DATE */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
            <Calendar className="h-3 w-3" />
            Date
          </div>
          <div className="text-white font-medium capitalize">
            {format(new Date(event.scheduled_date), "EEEE d MMMM yyyy", { locale: fr })}
          </div>
        </div>

        {/* TIME & DURATION */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
            <Clock className="h-3 w-3" />
            Heure & Durée
          </div>
          <div className="text-white font-medium">
             {format(new Date(event.scheduled_date), "HH:mm")}
             {event.duration_minutes && (
               <span className="text-gray-500 font-normal ml-1">({event.duration_minutes} min)</span>
             )}
          </div>
        </div>
      </div>

      {/* 2. COMMUNICATION METHOD */}
      {event.communication_method && (
        <div className="mb-6">
           <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-1">
              {getMethodIcon(event.communication_method)}
              Moyen
           </div>
           <div className="text-white">
             {getLabel(LABELS_COMMUNICATION_METHOD, event.communication_method)}
           </div>
        </div>
      )}

      {/* 3. CONNECTION DETAILS (Blue Box) */}
      {(event.event_link || event.phone_number || event.location) && (
        <div className="rounded-lg border border-blue-900/30 bg-blue-950/20 p-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase mb-3">
            <Info className="h-3 w-3" />
            Détails de connexion
          </div>

          <div className="space-y-3">
            {/* Link */}
            {event.event_link && (
               <div className="flex items-start gap-3">
                 <LinkIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                 <div className="min-w-0">
                   <div className="text-xs text-gray-500 mb-0.5">Lien Visio</div>
                   <a href={event.event_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all text-sm block">
                     {event.event_link}
                   </a>
                 </div>
               </div>
            )}

            {/* Phone */}
            {event.phone_number && (
               <div className="flex items-start gap-3">
                 <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                 <div>
                   <div className="text-xs text-gray-500 mb-0.5">Téléphone</div>
                   <p className="text-white text-sm font-mono">{event.phone_number}</p>
                 </div>
               </div>
            )}

            {/* Location */}
            {event.location && (
               <div className="flex items-start gap-3">
                 <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                 <div>
                   <div className="text-xs text-gray-500 mb-0.5">Adresse / Lieu</div>
                   <p className="text-white text-sm">{event.location}</p>
                 </div>
               </div>
            )}
          </div>
        </div>
      )}

      {/* 4. INSTRUCTIONS */}
      {event.instructions && (
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Instructions</h3>
          <div className="text-sm text-gray-200 bg-surface-hover p-3 rounded-md border border-white-subtle font-medium">
            {event.instructions}
          </div>
        </div>
      )}

      {/* 5. PERSONAL NOTES */}
      {event.notes && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
            <FileText className="h-3 w-3" />
            Notes Personnelles
          </h3>
          <div className="text-sm text-gray-300 bg-surface-deeper p-4 rounded-lg border border-white-subtle whitespace-pre-wrap leading-relaxed">
            {event.notes}
          </div>
        </div>
      )}
    </EntityDetailsSheet>
  );
}

import {
  CalendarDays, Clock, MapPin, Video, Phone, Mail, FileText,
  Podcast, Trash2, Pencil, Loader2, Link as LinkIcon, Info,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { ScheduledEvent } from '@/api/model';
import { useDeleteScheduledEvent } from '@/hooks/use-delete-scheduled-event';
import { LABELS_EVENT_STATUS, LABELS_COMMUNICATION_METHOD, getLabel } from '@/lib/dictionaries';
import { getStatusBadgeVariant } from '@/lib/utils';

interface EventDetailsProps {
  event: ScheduledEvent;
  onClose?: () => void;
  onEdit?: (event: ScheduledEvent) => void;
}

export function EventDetails({ event, onClose, onEdit }: EventDetailsProps) {
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteScheduledEvent();

  const handleDelete = () => {
    deleteEvent({ eventId: event.id }, {
      onSuccess: () => {
        if (onClose) onClose();
      }
    });
  };

  // Format date & time
  const eventDate = new Date(event.scheduled_date);
  const dateStr = format(eventDate, "EEEE d MMMM yyyy", { locale: fr });
  const timeStr = format(eventDate, "HH:mm");

  // Helper for communication method icon
  const MethodIcon = (() => {
    switch (event.communication_method) {
      case 'video': return Video;
      case 'phone': return Phone;
      case 'in_person': return MapPin;
      case 'email': return Mail;
      default: return Podcast;
    }
  })();

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-8 pb-10">

        {/* --- 1. HEADER & STATUS --- */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
             {/* Title & Badges */}
             <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                   <Badge variant="outline" className={`${getStatusBadgeVariant(event.status)}`}>
                      {getLabel(LABELS_EVENT_STATUS, event.status)}
                   </Badge>
                   {event.event_type && (
                      <Badge variant="secondary" className="bg-white/5 text-gray-400 hover:bg-white/10">
                        {event.event_type}
                      </Badge>
                   )}
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {event.title}
                </h2>
             </div>

             {/* Edit Action */}
             {onEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0"
                  onClick={() => onEdit(event)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
             )}
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* --- 2. KEY PROPERTIES GRID --- */}
        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                 <CalendarDays className="h-3.5 w-3.5" />
                 Date
              </div>
              <p className="text-sm font-medium text-white capitalize">{dateStr}</p>
           </div>

           <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                 <Clock className="h-3.5 w-3.5" />
                 Heure & Durée
              </div>
              <p className="text-sm font-medium text-white">
                 {timeStr}
                 {event.duration_minutes && <span className="text-gray-500 ml-1">({event.duration_minutes} min)</span>}
              </p>
           </div>

           <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                 <MethodIcon className="h-3.5 w-3.5" />
                 Moyen
              </div>
              <p className="text-sm font-medium text-white">
                 {getLabel(LABELS_COMMUNICATION_METHOD, event.communication_method)}
              </p>
           </div>
        </div>

        {/* --- 3. CONNECTION / LOCATION CARD --- */}
        {(event.event_link || event.location || event.phone_number) && (
           <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                 <Info className="h-3.5 w-3.5" />
                 Détails de connexion
              </h3>

              <div className="space-y-2">
                 {event.event_link && (
                    <div className="flex items-start gap-3">
                       <LinkIcon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                       <div className="min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">Lien Visio</p>
                          <a
                             href={event.event_link}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-sm text-blue-400 hover:text-blue-300 hover:underline break-all flex items-center gap-1"
                          >
                             {event.event_link}
                             <ExternalLink className="h-3 w-3" />
                          </a>
                       </div>
                    </div>
                 )}

                 {event.phone_number && (
                    <div className="flex items-start gap-3">
                       <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                       <div>
                          <p className="text-xs text-gray-500 mb-0.5">Téléphone</p>
                          <p className="text-sm text-white font-mono">{event.phone_number}</p>
                       </div>
                    </div>
                 )}

                 {event.location && (
                    <div className="flex items-start gap-3">
                       <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                       <div>
                          <p className="text-xs text-gray-500 mb-0.5">Adresse / Lieu</p>
                          <p className="text-sm text-white">{event.location}</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        )}

        {/* --- 4. TEXT SECTIONS --- */}
        {event.instructions && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
               Instructions
            </h3>
            <div className="text-sm text-gray-400 bg-[#0f1115] p-4 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
              {event.instructions}
            </div>
          </div>
        )}

        {event.notes && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
               <FileText className="h-4 w-4 text-gray-500" />
               Notes Personnelles
            </h3>
            <div className="text-sm text-gray-400 bg-[#0f1115] p-4 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
              {event.notes}
            </div>
          </div>
        )}

        <Separator className="bg-white/10" />

        {/* --- 5. FOOTER ACTIONS --- */}
        <div className="pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer l'événement
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#16181d] border-white/10 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Cette action est irréversible. L'événement sera définitivement retiré de votre agenda.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      </div>
    </ScrollArea>
  );
}

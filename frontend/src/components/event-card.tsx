import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  MoreHorizontal, Clock, MapPin, Video, Phone, Pencil, Trash2
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ScheduledEvent } from '@/api/model';
import { LABELS_EVENT_STATUS, getLabel } from '@/lib/dictionaries';
import { getStatusBadgeVariant } from '@/lib/utils';

interface EventCardProps {
  event: ScheduledEvent;
  onClick: (event: ScheduledEvent) => void;
  onEdit: (event: ScheduledEvent) => void;
  onDelete: (event: ScheduledEvent) => void;
}

export function EventCard({ event, onClick, onEdit, onDelete }: EventCardProps) {
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
    <Card
      onClick={() => onClick(event)}
      className="group relative flex flex-col border-none bg-[#16181d] transition-all hover:-translate-y-1 hover:bg-[#1c1f26] cursor-pointer shadow-lg overflow-hidden"
    >
      {/* Bandeau de couleur latérale selon le statut (optionnel, pour le style) */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusBadgeVariant(event.status).replace('bg-', 'bg-').split(' ')[0]}`} />

      <CardContent className="p-4 pl-6 space-y-4">

        {/* HEADER: Date + Menu (Flexbox pour éviter superposition) */}
        <div className="flex items-start justify-between">
          {/* Date Box */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center h-14 w-14 rounded-lg bg-white/5 border border-white/10 text-white">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                {format(date, 'MMM', { locale: fr })}
              </span>
              <span className="text-xl font-bold leading-none">
                {format(date, 'dd')}
              </span>
            </div>

            <div className="space-y-1">
              <Badge variant="outline" className={`${getStatusBadgeVariant(event.status)} text-[10px] px-2 py-0.5 h-5`}>
                {getLabel(LABELS_EVENT_STATUS, event.status)}
              </Badge>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                {format(date, 'HH:mm')}
                {event.duration_minutes && <span>• {event.duration_minutes} min</span>}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 -mr-2 text-muted-foreground hover:text-white hover:bg-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#16181d] border-white/10 text-white z-50">
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                className="cursor-pointer focus:bg-white/10"
              >
                <Pencil className="mr-2 h-4 w-4" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(event); }}
                className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* CONTENT: Title & Details */}
        <div>
          <h3 className="text-lg font-bold text-white line-clamp-1 mb-1" title={event.title}>
            {event.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="truncate max-w-[70%]">
              {event.event_type || "Événement"}
            </span>
            {event.communication_method && (
              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full text-xs">
                {getIconForMethod(event.communication_method)}
                <span className="capitalize">{event.communication_method.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

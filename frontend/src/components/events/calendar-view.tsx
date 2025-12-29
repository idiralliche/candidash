import { useState } from 'react';
import {
  format, addDays, isSameDay, startOfDay,
  addWeeks, subWeeks, isToday, endOfDay
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, MapPin, Clock,
  MoreHorizontal, Plus, Calendar as CalendarIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScheduledEvent } from '@/api/model';
import { getStatusBadgeVariant } from '@/lib/assign-colors';
import { getLabel, LABELS_EVENT_STATUS } from '@/lib/dictionaries';

interface CalendarViewProps {
  events: ScheduledEvent[];
  onSelectEvent: (event: ScheduledEvent) => void;
  onAddEvent: (date: Date) => void;
}

export function CalendarView({ events, onSelectEvent, onAddEvent }: CalendarViewProps) {
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [expandedDate, setExpandedDate] = useState<Date>(startOfDay(new Date()));

  // Generate the 7 days to show in the current week view
  const daysToShow = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const lastDayShown = daysToShow[daysToShow.length - 1];

  // Calculate upcoming events count after the last day shown
  const upcomingEventsCount = events.filter(e => new Date(e.scheduled_date) > endOfDay(lastDayShown)).length;

  const nextWeek = () => setStartDate(addWeeks(startDate, 1));
  const prevWeek = () => setStartDate(subWeeks(startDate, 1));

  const goToToday = () => {
    const today = startOfDay(new Date());
    setStartDate(today);
    setExpandedDate(today);
  };

  return (
    <div className="flex flex-col h-full bg-[#16181d] rounded-xl border border-white/10 shadow-lg overflow-hidden max-w-2xl mx-auto w-full">

      {/* --- 1. HEADER --- */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1c1f26]">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-white capitalize w-32">
            {format(startDate, 'MMMM yyyy', { locale: fr })}
          </h2>

          {/* "Today" Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className={`
              h-7 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 bg-transparent
              ${isToday(startDate) ? 'opacity-50 cursor-default' : ''}
            `}
            disabled={isToday(startDate)}
          >
            <CalendarIcon className="mr-2 h-3 w-3" />
            Aujourd'hui
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          <Button variant="ghost" size="icon" onClick={prevWeek} className="h-7 w-7 hover:bg-white/10 text-white">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="w-[1px] h-4 bg-white/10" />
          <Button variant="ghost" size="icon" onClick={nextWeek} className="h-7 w-7 hover:bg-white/10 text-white">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* --- 2. DAYS LIST --- */}
      <ScrollArea className="flex-1 bg-[#16181d]">
        <div className="p-4 space-y-3">
          {daysToShow.map((day) => {
            const isExpanded = isSameDay(day, expandedDate);
            const isDayToday = isToday(day);

            // Filter and sort events for the current day
            const dayEvents = events.filter(e => isSameDay(new Date(e.scheduled_date), day))
                                    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

            return (
              <div
                key={day.toISOString()}
                onClick={() => setExpandedDate(day)}
                className={`
                  rounded-xl transition-all duration-300 border cursor-pointer overflow-hidden
                  ${isExpanded
                    ? 'border-blue-500/50 bg-[#1c1f26] shadow-[0_4px_20px_-5px_rgba(59,130,246,0.15)]' // 🔵 Bleu au lieu de Primary
                    : 'border-transparent bg-[#1c1f26]/50 hover:bg-[#1c1f26] hover:border-white/5'
                  }
                `}
              >
                {/* --- EXPANDED STATE --- */}
                {isExpanded ? (
                  <div className="animate-in fade-in zoom-in-95 duration-200">
                    {/* Current Day Header */}
                    <div className="bg-blue-500/10 border-b border-blue-500/20 p-3 flex justify-between items-center">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-blue-400 capitalize">
                          {format(day, 'EEEE d', { locale: fr })}
                        </span>
                        {isDayToday && <Badge className="text-[10px] h-5 px-1.5 bg-blue-500 hover:bg-blue-600 text-white border-none">Aujourd'hui</Badge>}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-blue-400/70 font-medium">
                          {dayEvents.length} rdv
                        </span>
                        {/* Add Button (+) */}
                        <Button
                          size="icon"
                          className="h-6 w-6 rounded-full bg-blue-500 hover:bg-blue-400 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddEvent(day);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="p-4 space-y-0">
                      {dayEvents.length === 0 ? (
                        <div className="py-6 text-center text-gray-500 text-sm italic">
                          Rien de prévu.
                          <button
                            className="ml-2 text-blue-400 hover:underline"
                            onClick={(e) => { e.stopPropagation(); onAddEvent(day); }}
                          >
                            Ajouter un RDV ?
                          </button>
                        </div>
                      ) : (
                        dayEvents.map((event, idx) => (
                          <div key={event.id} className="relative flex gap-4 group">
                            {/* Vertical Line */}
                            {idx !== dayEvents.length - 1 && (
                              <div className="absolute left-[54px] top-8 bottom-[-20px] w-[2px] bg-white/5 group-hover:bg-white/10 transition-colors" />
                            )}

                            {/* Hour */}
                            <div className="w-12 pt-1 text-right text-xs font-mono text-gray-400 shrink-0">
                              {format(new Date(event.scheduled_date), 'HH:mm')}
                            </div>

                            {/* Card */}
                            <div className="flex-1 pb-6">
                              <div
                                onClick={(e) => { e.stopPropagation(); onSelectEvent(event); }}
                                className="bg-[#16181d] border border-white/5 p-3 rounded-lg hover:border-blue-500/50 hover:bg-white/5 transition-all group/card relative"
                              >
                                {/* Point Timeline */}
                                <div className="absolute -left-[21px] top-4 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-[#1c1f26]" />

                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-semibold text-gray-200 text-sm">{event.title}</h4>
                                  <Badge variant="outline" className={`${getStatusBadgeVariant(event.status)} text-[10px] h-5 px-1.5`}>
                                      {getLabel(LABELS_EVENT_STATUS, event.status)}
                                  </Badge>
                                </div>

                                <div className="text-xs text-gray-500 line-clamp-1 mb-2">
                                  {event.event_type || "Événement"}
                                </div>

                                {(event.location || event.event_link) && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-black/20 p-1.5 rounded w-fit">
                                    {event.location ? <MapPin size={12} /> : <Clock size={12} />}
                                    <span className="truncate max-w-[200px]">
                                      {event.location || "En ligne / Lien disponible"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  /* --- COLLAPSED STATE --- */
                  <div className="flex items-center p-3 gap-4 h-[72px]">
                    <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-white/5 pr-4 py-1">
                      <span className={`text-xl font-bold leading-none ${isDayToday ? 'text-blue-400' : 'text-white'}`}>
                        {format(day, 'd')}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-gray-500 mt-1">
                        {format(day, 'EEE', { locale: fr })}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      {dayEvents.length === 0 ? (
                        <span className="text-xs text-gray-600 italic">Aucun événement</span>
                      ) : (
                        dayEvents.slice(0, 2).map((evt) => (
                          <div key={evt.id} className="flex items-center text-xs text-gray-400 truncate">
                            <span className="font-mono text-gray-500 mr-2 opacity-70">
                              {format(new Date(evt.scheduled_date), 'HH:mm')}
                            </span>
                            <span className="text-gray-300 truncate">{evt.title}</span>
                          </div>
                        ))
                      )}
                      {dayEvents.length > 2 && (
                        <span className="text-[10px] text-blue-400/70 font-medium">
                          + {dayEvents.length - 2} autres...
                        </span>
                      )}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* --- 3. FOOTER --- */}
          <div className="pt-4 pb-8 text-center space-y-2">
            <Button variant="ghost" className="text-xs text-gray-400 hover:text-white w-full bg-white/5 hover:bg-white/10" onClick={nextWeek}>
              Voir les jours suivants <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
            <p className="text-[10px] text-gray-600 uppercase font-semibold tracking-wider">
              {upcomingEventsCount > 0
                ? `+ ${upcomingEventsCount} événement${upcomingEventsCount > 1 ? 's' : ''} à venir plus tard`
                : "Aucun autre événement planifié"
              }
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

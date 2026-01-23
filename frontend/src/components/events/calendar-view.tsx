import { useState } from 'react';
import {
  format,
  addDays,
  isSameDay,
  startOfDay,
  addWeeks,
  subWeeks,
  isToday,
  endOfDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  MoreHorizontal,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScheduledEvent } from '@/api/model';
import { getEventStatusPalette } from '@/lib/semantic-ui';
import {
  getLabel,
  LABELS_EVENT_STATUS
} from '@/lib/dictionaries';

interface CalendarViewProps {
  events: ScheduledEvent[];
  onSelectEvent: (event: ScheduledEvent) => void;
  onAddEvent: (date: Date) => void;
}

export function CalendarView({ events, onSelectEvent, onAddEvent }: CalendarViewProps) {
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [expandedDate, setExpandedDate] = useState<Date>(startOfDay(new Date()));

  const daysToShow = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const lastDayShown = daysToShow[daysToShow.length - 1];
  const upcomingEventsCount = events.filter(e => new Date(e.scheduled_date) > endOfDay(lastDayShown)).length;

  const nextWeek = () => setStartDate(addWeeks(startDate, 1));
  const prevWeek = () => setStartDate(subWeeks(startDate, 1));

  const goToToday = () => {
    const today = startOfDay(new Date());
    setStartDate(today);
    setExpandedDate(today);
  };

  return (
    <div className="w-full bg-surface-base rounded-xl border border-white-light shadow-lg overflow-hidden">
      {/* --- 1. HEADER --- */}
      <div className="flex items-center justify-between p-4 border-b border-white-light bg-surface-hover">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-white capitalize w-32">
            {format(startDate, 'MMMM yyyy', { locale: fr })}
          </h2>

          {/* "Today" Button */}
          <Button
            variant="outline"
            palette="blue"
            size="sm"
            onClick={goToToday}
            disabled={isToday(startDate)}
            className="h-7 text-xs disabled:opacity-50"
          >
            <CalendarIcon className="h-3 w-3" />
            Aujourd'hui
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-white-subtle rounded-lg p-1 border border-white-light">
          <Button
            variant="ghost"
            palette="white"
            size="icon"
            onClick={prevWeek}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="w-[1px] h-4 bg-white-light" />
          <Button
            variant="ghost"
            palette="white"
            size="icon"
            onClick={nextWeek}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* --- 2. DAYS LIST --- */}
      <div className="p-4 space-y-3">
        {daysToShow.map((day) => {
          const isExpanded = isSameDay(day, expandedDate);
          const isDayToday = isToday(day);

          const dayEvents = events.filter(e => isSameDay(new Date(e.scheduled_date), day))
                                  .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());

          return (
            <div
              key={day.toISOString()}
              onClick={() => setExpandedDate(day)}
              className={`
                rounded-xl transition-all duration-300 border cursor-pointer overflow-hidden
                ${isExpanded
                  ? 'border-blue-500/50 bg-surface-hover shadow-[0_4px_20px_-5px_rgba(59,130,246,0.15)]'
                  : 'border-transparent bg-surface-hover/50 hover:bg-surface-hover hover:border-white-subtle'
                }
              `}
            >
              {/* --- EXPANDED STATE --- */}
              {isExpanded ? (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-blue-500/10 border-b border-blue-500/20 p-3 flex justify-between items-center">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-blue-400 capitalize">
                        {format(day, 'EEEE d', { locale: fr })}
                      </span>
                      {isDayToday && (
                        <Badge
                          variant="solid"
                          palette="blue"
                          className="text-[10px] h-5 px-1.5"
                        >
                          Aujourd'hui
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-blue-400/70 font-medium">
                        {dayEvents.length} rdv
                      </span>
                      <Button
                        size="icon-xs"
                        shape="pill"
                        variant="solid"
                        palette="blue"
                        className="shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddEvent(day);
                        }}
                      >
                        <Plus className="h-3 w-3" />
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
                          {idx !== dayEvents.length - 1 && (
                            <div className="absolute left-[54px] top-8 bottom-[-20px] w-[2px] bg-white-subtle group-hover:bg-white-light transition-colors" />
                          )}

                          <div className="w-12 pt-1 text-right text-xs font-mono text-gray-400 shrink-0">
                            {format(new Date(event.scheduled_date), 'HH:mm')}
                          </div>

                          <div className="flex-1 pb-6">
                            <div
                              onClick={(e) => { e.stopPropagation(); onSelectEvent(event); }}
                              className="bg-surface-base border border-white-subtle p-3 rounded-lg hover:border-blue-500/50 hover:bg-white-subtle transition-all group/card relative"
                            >
                              <div className="absolute -left-[21px] top-4 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-[#1c1f26]" />

                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-gray-200 text-sm">{event.title}</h4>

                                <Badge
                                  variant="subtle"
                                  palette={getEventStatusPalette(event.status)}
                                  className="text-[10px] h-5 px-1.5"
                                >
                                    {getLabel(LABELS_EVENT_STATUS, event.status)}
                                </Badge>
                              </div>

                              <div className="text-xs text-gray-500 line-clamp-1 mb-2">
                                {event.event_type || "Événement"}
                              </div>

                              {(event.location || event.event_link) && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-black-medium p-1.5 rounded w-fit">
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
                  <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-white-subtle pr-4 py-1">
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
        <div className="pt-4 text-center space-y-2">
          <Button
            variant="ghost"
            palette="gray"
            className="text-xs w-full hover:text-white"
            onClick={nextWeek}
          >
            Voir les jours suivants
            <ChevronRight className="h-3 w-3" />
          </Button>
          <p className="text-[10px] text-gray-600 uppercase font-semibold tracking-wider">
            {upcomingEventsCount > 0
              ? `+ ${upcomingEventsCount} événement${upcomingEventsCount > 1 ? 's' : ''} à venir plus tard`
              : "Aucun autre événement planifié"
            }
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';

import { useScheduledEvents } from '@/hooks/use-scheduled-events';
import { useDeleteScheduledEvent } from '@/hooks/use-delete-scheduled-event';
import { ScheduledEvent } from '@/api/model';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

import { EntitySheet } from '@/components/shared/entity-sheet';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';
import { FormDialog } from '@/components/shared/form-dialog';

import { EventForm } from '@/components/events/event-form';
import { EventDetails } from '@/components/events/event-details';
import { EventCard } from '@/components/events/event-card';
import { CalendarView } from '@/components/events/calendar-view';

export function EventsPage() {
  const { events, isLoading } = useScheduledEvents();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteScheduledEvent();

  // State
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<ScheduledEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<ScheduledEvent | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<Date | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string>('');

  // Chronological sorting for list view
  const sortedEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort((a, b) =>
      new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
    );
  }, [events]);

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setDeleteError('');
    try {
      await deleteEvent({ eventId: eventToDelete.id });
      toast.success('Événement supprimé');
      setEventToDelete(null);
    } catch {
      setDeleteError('Erreur lors de la suppression');
    }
  };

  const handleOpenCreate = (date?: Date) => {
    setCreateDate(date);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6 pt-20 h-[calc(100vh-2rem)] flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Agenda</h1>

        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list')}>
            <TabsList className="bg-[#16181d] border border-white/10">
              <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendrier
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Liste
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="icon"
            onClick={() => handleOpenCreate(undefined)}
            className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          viewMode === 'calendar' ? (
             /* CALENDAR SKELETON */
             <div className="max-w-2xl mx-auto w-full bg-[#16181d] rounded-xl border border-white/10 h-[600px] p-4 space-y-4">
               <div className="flex justify-between items-center mb-6">
                 <Skeleton className="h-8 w-48 bg-white/10" />
                 <Skeleton className="h-8 w-24 bg-white/10" />
               </div>
               <div className="space-y-2">
                 {Array.from({ length: 7 }).map((_, i) => (
                   <Skeleton key={i} className="h-[72px] w-full rounded-xl bg-white/5" />
                 ))}
               </div>
             </div>
          ) : (
            /* LIST SKELETON */
            <div className="flex flex-col gap-4 pb-8 max-w-4xl mx-auto w-full">
              <CardListSkeleton cardHeight="h-24" />
            </div>
          )
        ) : (
          viewMode === 'calendar' ? (
            <CalendarView
              events={events || []}
              onSelectEvent={setSelectedEvent}
              onAddEvent={(date) => handleOpenCreate(date)}
            />
          ) : (
            /* LIST VIEW */
            sortedEvents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucun événement. Utilisez le bouton + pour planifier.
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-8 max-w-4xl mx-auto w-full">
                {sortedEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={setSelectedEvent}
                    onEdit={setEditingEvent}
                    onDelete={setEventToDelete}
                  />
                ))}
              </div>
            )
          )
        )}
      </div>

      {/* --- CREATE DIALOG --- */}
      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Nouvel événement"
        description="Planifiez un entretien, une relance ou une réunion."
      >
        {(close) => (
          <EventForm
            onSuccess={close}
            defaultDate={createDate}
          />
        )}
      </FormDialog>

      {/* --- DETAILS SHEET --- */}
      <EntitySheet
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        title="Détails"
      >
        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onEdit={(e) => {
               setSelectedEvent(null);
               setEditingEvent(e);
            }}
            onDelete={(e) => {
               setSelectedEvent(null);
               setEventToDelete(e);
            }}
          />
        )}
      </EntitySheet>

      {/* --- EDIT DIALOG --- */}
      <FormDialog
        open={!!editingEvent}
        onOpenChange={(open) => !open && setEditingEvent(null)}
        title="Modifier l'événement"
      >
        {(close) => editingEvent && (
            <EventForm
              initialData={editingEvent}
              onSuccess={close}
            />
        )}
      </FormDialog>

      {/* --- DELETE ALERT --- */}
      <EntityDeleteDialog
        open={!!eventToDelete}
        onOpenChange={(open) => {
            if (!open) {
                setEventToDelete(null);
                setDeleteError('');
            }
        }}
        entityType="event"
        entityLabel={eventToDelete?.title || ''}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}

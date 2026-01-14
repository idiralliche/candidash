import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  LayoutGrid,
  Calendar as CalendarIcon,
} from 'lucide-react';

import { useScheduledEvents } from '@/hooks/scheduled-events/use-scheduled-events';
import { useDeleteScheduledEvent } from '@/hooks/scheduled-events/use-delete-scheduled-event';
import { ScheduledEvent } from '@/api/model';

import { Fab } from '@/components/ui/fab';
import { ViewTabs } from '@/components/ui/view-tabs';
import { EmptyState } from '@/components/shared/empty-state';

// Layout Components
import { PageLayout } from '@/components/layouts/page-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { PageContent } from '@/components/layouts/page-content';

// Shared Components
import { EntitySheet } from '@/components/shared/entity-sheet';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';
import { FormDialog } from '@/components/shared/form-dialog';

// Feature Components
import { EventForm } from '@/components/events/event-form';
import { EventDetails } from '@/components/events/event-details';
import { EventCard } from '@/components/events/event-card';
import { CalendarView } from '@/components/events/calendar-view';
import { CalendarSkeleton } from '@/components/events/calendar-skeleton';

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
    <PageLayout>
      <PageHeader
        title="Agenda"
        tabs={
          <ViewTabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as 'calendar' | 'list')}
            tabs={[
              { value: 'calendar', label: 'Calendrier', icon: CalendarIcon },
              { value: 'list', label: 'Liste', icon: LayoutGrid },
            ]}
          />
        }
        action={
          <Fab palette="blue" onClick={() => handleOpenCreate(undefined)}>
            <Plus className="h-5 w-5" />
          </Fab>
        }
      />

      <PageContent>
        {isLoading ? (
          viewMode === 'calendar' ? (
            <CalendarSkeleton />
          ) : (
            <CardListSkeleton cardHeight="h-24" />
          )
        ) : viewMode === 'calendar' ? (
          <CalendarView
            events={events || []}
            onSelectEvent={setSelectedEvent}
            onAddEvent={(date) => handleOpenCreate(date)}
          />
        ) : sortedEvents.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            message="Aucun événement planifié"
            action={
              <Fab palette="blue" onClick={() => handleOpenCreate(undefined)}>
                <Plus className="h-5 w-5 mr-2" />
                Ajouter un événement
              </Fab>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
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
        )}
      </PageContent>

      {/* CREATE DIALOG */}
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

      {/* DETAILS SHEET */}
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

      {/* EDIT DIALOG */}
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

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!eventToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setEventToDelete(null);
            setDeleteError('');
          }
        }}
        entityType="événement"
        entityLabel={eventToDelete?.title || ''}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </PageLayout>
  );
}

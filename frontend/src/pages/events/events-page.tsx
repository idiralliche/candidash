import {
  Plus,
  LayoutGrid,
  Calendar as CalendarIcon,
} from 'lucide-react';

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

// Logic Hook
import { useEventsPageLogic } from '@/hooks/scheduled-events/use-events-page-logic';

export function EventsPage() {
  const logic = useEventsPageLogic();

  return (
    <PageLayout>
      <PageHeader
        title="Agenda"
        tabs={
          <ViewTabs
            value={logic.viewMode}
            onValueChange={(v) => logic.setViewMode(v as 'calendar' | 'list')}
            tabs={[
              { value: 'calendar', label: 'Calendrier', icon: CalendarIcon },
              { value: 'list', label: 'Liste', icon: LayoutGrid },
            ]}
          />
        }
        action={
          <Fab palette="blue" onClick={() => logic.handleOpenCreate(undefined)}>
            <Plus className="h-5 w-5" />
          </Fab>
        }
      />

      <PageContent>
        {logic.isLoading ? (
          logic.viewMode === 'calendar' ? (
            <CalendarSkeleton />
          ) : (
            <CardListSkeleton cardHeight="h-24" />
          )
        ) : logic.viewMode === 'calendar' ? (
          <CalendarView
            events={logic.events || []}
            onSelectEvent={logic.setSelectedEvent}
            onAddEvent={(date) => logic.handleOpenCreate(date)}
          />
        ) : logic.sortedEvents.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            message="Aucun événement planifié"
            action={
              <Fab palette="blue" onClick={() => logic.handleOpenCreate(undefined)}>
                <Plus className="h-5 w-5 mr-2" />
                Ajouter un événement
              </Fab>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {logic.sortedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={logic.setSelectedEvent}
                onEdit={logic.setEditingEvent}
                onDelete={logic.setEventToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* CREATE DIALOG */}
      <FormDialog
        open={logic.isCreateOpen}
        onOpenChange={logic.setIsCreateOpen}
        title="Nouvel événement"
        description="Planifiez un entretien, une relance ou une réunion."
      >
        {(close) => (
          <EventForm
            onSuccess={close}
            defaultDate={logic.createDate}
          />
        )}
      </FormDialog>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!logic.selectedEvent}
        onOpenChange={(open) => !open && logic.setSelectedEvent(null)}
      >
        {logic.selectedEvent && (
          <EventDetails
            event={logic.selectedEvent}
            onEdit={logic.openEditFromDetails}
            onDelete={logic.openDeleteFromDetails}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!logic.editingEvent}
        onOpenChange={(open) => !open && logic.setEditingEvent(null)}
        title="Modifier l'événement"
      >
        {(close) => logic.editingEvent && (
          <EventForm
            initialData={logic.editingEvent}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!logic.eventToDelete}
        onOpenChange={logic.closeDeleteDialog}
        entityType="événement"
        entityLabel={logic.eventToDelete?.title || ''}
        onConfirm={logic.handleDelete}
        isDeleting={logic.isDeleting}
        error={logic.deleteError}
      />
    </PageLayout>
  );
}

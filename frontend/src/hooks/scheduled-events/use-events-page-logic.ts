import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { useScheduledEvents } from '@/hooks/scheduled-events/use-scheduled-events';
import { useDeleteScheduledEvent } from '@/hooks/scheduled-events/use-delete-scheduled-event';
import { ScheduledEvent } from '@/api/model';

export function useEventsPageLogic() {
  const { events, isLoading } = useScheduledEvents();
  const { mutateAsync: deleteEvent, isPending: isDeleting } = useDeleteScheduledEvent();

  // --- STATE ---
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<ScheduledEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<ScheduledEvent | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<Date | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string>('');

  // --- SORTING ---
  const sortedEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort((a, b) =>
      new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
    );
  }, [events]);

  // --- HANDLERS ---
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

  const closeDeleteDialog = (open: boolean) => {
    if (!open) {
      setEventToDelete(null);
      setDeleteError('');
    }
  };

  const openEditFromDetails = (event: ScheduledEvent) => {
    setSelectedEvent(null);
    setEditingEvent(event);
  };

  const openDeleteFromDetails = (event: ScheduledEvent) => {
    setSelectedEvent(null);
    setEventToDelete(event);
  };

  return {
    // Data
    events,
    sortedEvents,
    isLoading,

    // UI State
    viewMode,
    setViewMode,
    selectedEvent,
    setSelectedEvent,
    eventToDelete,
    setEventToDelete,
    editingEvent,
    setEditingEvent,
    isCreateOpen,
    setIsCreateOpen,
    createDate,
    setCreateDate,
    deleteError,
    isDeleting,

    // Handlers
    handleDelete,
    handleOpenCreate,
    closeDeleteDialog,
    openEditFromDetails,
    openDeleteFromDetails,
  };
}

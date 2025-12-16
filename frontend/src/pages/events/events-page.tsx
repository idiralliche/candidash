import { useState, useMemo } from 'react';
import { Plus, LayoutGrid, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useScheduledEvents } from '@/hooks/use-scheduled-events';
import { useDeleteScheduledEvent } from '@/hooks/use-delete-scheduled-event';
import { ScheduledEvent } from '@/api/model';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';

import { EventForm } from '@/components/event-form';
import { EventDetails } from '@/components/event-details';
import { EventCard } from '@/components/event-card';
import { CalendarView } from '@/components/calendar-view';

export function EventsPage() {
  const { events, isLoading } = useScheduledEvents();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteScheduledEvent();

  // State
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedEvent, setSelectedEvent] = useState<ScheduledEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<ScheduledEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<ScheduledEvent | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDate, setCreateDate] = useState<Date | undefined>(undefined);

  // Tri chronologique des événements
  const sortedEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort((a, b) =>
      new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
    );
  }, [events]);

  const handleDelete = () => {
    if (!eventToDelete) return;
    deleteEvent({ eventId: eventToDelete.id }, {
      onSuccess: () => setEventToDelete(null)
    });
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
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
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
          viewMode === "calendar" ? (
             /* SKELETON CALENDRIER */
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
            /* SKELETON LISTE VERTICALE */
            <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-xl bg-[#16181d] p-4 border border-white/5">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <Skeleton className="h-14 w-14 rounded-lg bg-white/10" /> {/* Date Box */}
                         <div className="space-y-2">
                            <Skeleton className="h-5 w-48 bg-white/10" /> {/* Titre */}
                            <Skeleton className="h-3 w-32 bg-white/5" />  {/* Heure */}
                         </div>
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full bg-white/5" /> {/* Menu */}
                   </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <>
            {/* VUE CALENDRIER */}
            {viewMode === "calendar" && (
              <CalendarView
                events={events || []}
                onSelectEvent={setSelectedEvent}
                onAddEvent={(date) => handleOpenCreate(date)}
              />
            )}

            {/* VUE LISTE */}
            {viewMode === "list" && (
               sortedEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Aucun événement. Utilisez le bouton + pour planifier.
                </div>
              ) : (
                <div className="flex flex-col gap-4 pb-8 max-w-4xl mx-auto w-full">
                  {sortedEvents.map((event) => (
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
            )}
          </>
        )}
      </div>

      {/* --- CREATE DIALOG --- */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#13151a] border-white/10 text-white sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Nouvel Événement</DialogTitle>
                <DialogDescription className="text-gray-400">
                    Planifiez un entretien, une relance ou une réunion.
                </DialogDescription>
            </DialogHeader>
            <EventForm
                onSuccess={() => setIsCreateOpen(false)}
                defaultDate={createDate}
            />
        </DialogContent>
      </Dialog>

      {/* --- DETAILS SHEET --- */}
      <Sheet open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <SheetContent className="sm:max-w-xl w-full border-l border-white/10 bg-[#16181d] text-white">
          <SheetHeader className="pb-4">
            <SheetTitle>Détails</SheetTitle>
          </SheetHeader>
          {selectedEvent && (
            <EventDetails
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onEdit={(event) => {
                setSelectedEvent(null);
                setEditingEvent(event);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* --- EDIT DIALOG --- */}
      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="bg-[#13151a] border-white/10 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <EventForm
              initialData={editingEvent}
              onSuccess={() => setEditingEvent(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --- DELETE ALERT --- */}
      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent className="bg-[#16181d] border-white/10 text-white">
            <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                    Irréversible.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 text-white">Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

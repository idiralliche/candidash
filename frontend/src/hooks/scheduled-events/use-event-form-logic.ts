import { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  addHours,
  startOfHour,
  format,
} from 'date-fns';

import { useCreateScheduledEvent } from '@/hooks/scheduled-events/use-create-scheduled-event';
import { useUpdateScheduledEvent } from '@/hooks/scheduled-events/use-update-scheduled-event';
import {
  ScheduledEvent,
  EventStatus,
  CommunicationMethod,
} from '@/api/model';

// --- Zod Schema ---

export const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  date: z.date({ required_error: "La date est requise" }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format invalide"),

  event_type: z.string().max(100).optional(),
  status: z.nativeEnum(EventStatus).default(EventStatus.pending),
  duration_minutes: z.coerce.number().min(1).optional(),
  communication_method: z.nativeEnum(CommunicationMethod).optional(),
  event_link: z.string().max(255).url({ message: "URL invalide" }).optional().or(z.literal('')),
  phone_number: z.string().max(20).optional(),
  location: z.string().max(500).optional(),
  instructions: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

interface UseEventFormLogicProps {
  initialData?: ScheduledEvent;
  defaultDate?: Date;
  onSuccess?: (event?: ScheduledEvent) => void;
}

export function useEventFormLogic({ initialData, defaultDate, onSuccess }: UseEventFormLogicProps) {
  // --- Mutations ---
  const {
    mutateAsync: createEvent,
    isPending: isCreating,
    error: createError
  } = useCreateScheduledEvent();

  const {
    mutateAsync: updateEvent,
    isPending: isUpdating,
    error: updateError
  } = useUpdateScheduledEvent();

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  // --- Date Initialization Logic ---
  const getDefaultDateTime = useCallback(() => {
    let dateObj = new Date();

    if (initialData?.scheduled_date) {
      // Case 1: Editing an existing event
      dateObj = new Date(initialData.scheduled_date);
    } else if (defaultDate) {
      // Case 2: Creating from a calendar slot (defaultDate provided)
      dateObj = new Date(defaultDate);
      const now = new Date();
      // If the selected date is today, default to next hour. Otherwise, 9 AM.
      if (dateObj.toDateString() === now.toDateString()) {
        dateObj = startOfHour(addHours(now, 1));
      } else {
        dateObj.setHours(9, 0, 0, 0);
      }
    } else {
      // Case 3: Creating from scratch (default to next hour)
      dateObj = startOfHour(addHours(new Date(), 1));
    }

    return {
      date: dateObj,
      time: format(dateObj, 'HH:mm')
    };
  }, [initialData, defaultDate]);

  const defaults = getDefaultDateTime();

  // --- Form Setup ---
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      date: defaults.date,
      time: defaults.time,
      event_type: initialData?.event_type || '',
      status: initialData?.status || EventStatus.pending,
      duration_minutes: initialData?.duration_minutes || 30,
      communication_method: initialData?.communication_method || undefined,
      event_link: initialData?.event_link || '',
      phone_number: initialData?.phone_number || '',
      location: initialData?.location || '',
      instructions: initialData?.instructions || '',
      notes: initialData?.notes || '',
    },
  });

  // --- Effects ---

  // Reset form when initialData changes (e.g., when opening a different event in a modal)
  useEffect(() => {
    if (initialData) {
      const d = new Date(initialData.scheduled_date);
      form.reset({
        title: initialData.title,
        date: d,
        time: format(d, 'HH:mm'),
        event_type: initialData.event_type || '',
        status: initialData.status,
        duration_minutes: initialData.duration_minutes || undefined,
        communication_method: initialData.communication_method || undefined,
        event_link: initialData.event_link || '',
        phone_number: initialData.phone_number || '',
        location: initialData.location || '',
        instructions: initialData.instructions || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData, form]);

  // --- Submit Handler ---
  async function onSubmit(values: EventFormValues) {
    // Merge date object and time string into a single ISO string
    const [hours, minutes] = values.time.split(':').map(Number);
    const scheduledDate = new Date(values.date);
    scheduledDate.setHours(hours, minutes, 0, 0);

    const payload = {
      title: values.title,
      scheduled_date: scheduledDate.toISOString(),
      status: values.status,
      duration_minutes: values.duration_minutes,
      event_type: values.event_type || null,
      communication_method: values.communication_method || null,
      event_link: values.event_link || null,
      phone_number: values.phone_number || null,
      location: values.location || null,
      instructions: values.instructions || null,
      notes: values.notes || null,
    };

    try {
      let resultEvent: ScheduledEvent | undefined;

      if (isEditing && initialData) {
        const result = await updateEvent({ eventId: initialData.id, data: payload });
        resultEvent = result as unknown as ScheduledEvent;
      } else {
        resultEvent = await createEvent({ data: payload });
      }

      form.reset();
      if (onSuccess) onSuccess(resultEvent);
    } catch (err) {
      console.error("Error saving event", err);
    }
  }

  return {
    form,
    onSubmit: onSubmit,
    isEditing,
    isPending,
    error,
  };
}

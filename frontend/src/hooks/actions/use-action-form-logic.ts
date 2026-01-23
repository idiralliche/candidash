import { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useCreateAction } from '@/hooks/actions/use-create-action';
import { useUpdateAction } from '@/hooks/actions/use-update-action';
import { useApplications } from '@/hooks/applications/use-applications';
import { useScheduledEvents } from '@/hooks/scheduled-events/use-scheduled-events';
import { Action, ScheduledEvent } from '@/api/model';

// Types
interface PaginatedEvents {
  items: ScheduledEvent[];
  total?: number;
}

// Zod Schema
export const actionSchema = z.object({
  type: z.string({ required_error: 'Le type est requis' }).min(1, 'Le type est requis').max(50),
  application_id: z.string({ required_error: 'La candidature est requise' }).min(1, 'La candidature est requise'),
  scheduled_event_id: z.string().optional().or(z.literal('')),
  notes: z.string().max(5000).optional(),
  completed_date: z.date().optional().nullable(),
  is_completed: z.boolean().default(false),
});

export type ActionFormValues = z.infer<typeof actionSchema>;

// Hook Props
interface UseActionFormLogicProps {
  initialData?: Action;
  applicationId?: number | null;
  availableEvents?: ScheduledEvent[];
  onSuccess?: (action?: Action) => void;
}

export function useActionFormLogic({
  initialData,
  applicationId,
  availableEvents = [],
  onSuccess,
}: UseActionFormLogicProps) {

  // Mutations
  const { mutateAsync: createAction, isPending: isCreating, error: createError } = useCreateAction();
  const { mutateAsync: updateAction, isPending: isUpdating, error: updateError } = useUpdateAction();

  // Data fetching
  const { applications, isLoading: isLoadingApps } = useApplications();
  const { events: fetchedEventsResult, isLoading: isLoadingEvents } = useScheduledEvents();

  // Refs
  const applicationSelectTriggerRef = useRef<HTMLButtonElement>(null);

  // Form
  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      type: initialData?.type || '',
      application_id: initialData?.application_id
        ? String(initialData.application_id)
        : applicationId ? String(applicationId) : '',
      scheduled_event_id: initialData?.scheduled_event_id ? String(initialData.scheduled_event_id) : '',
      notes: initialData?.notes || '',
      completed_date: initialData?.completed_date ? new Date(initialData.completed_date) : null,
      is_completed: !!initialData?.completed_date,
    },
  });

  // Watch is_completed
  const isCompleted = useWatch({
    control: form.control,
    name: 'is_completed',
  });

  // Merge wizard events + DB events
  const eventsList = useMemo(() => {
    let fetchedEvents: ScheduledEvent[] = [];

    if (Array.isArray(fetchedEventsResult)) {
      fetchedEvents = fetchedEventsResult;
    } else if (fetchedEventsResult && 'items' in (fetchedEventsResult as object)) {
      fetchedEvents = (fetchedEventsResult as PaginatedEvents).items;
    }

    const eventsMap = new Map<number, ScheduledEvent>();
    fetchedEvents.forEach((evt) => eventsMap.set(evt.id, evt));
    availableEvents.forEach((evt) => {
      if (!eventsMap.has(evt.id)) eventsMap.set(evt.id, evt);
    });

    return Array.from(eventsMap.values()).sort((a, b) =>
      new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
    );
  }, [fetchedEventsResult, availableEvents]);

  // Current application (for display)
  const currentApplication = useMemo(() => {
    if (!applicationId || !applications) return null;
    return applications.find(app => app.id === applicationId);
  }, [applicationId, applications]);

  // Effect: Auto-focus application select if not pre-filled
  useEffect(() => {
    if (!applicationId && !isLoadingApps && applicationSelectTriggerRef.current) {
      setTimeout(() => {
        applicationSelectTriggerRef.current?.focus();
      }, 0);
    }
  }, [isLoadingApps, applicationId]);

  // Effect: Auto-set completed_date when is_completed changes
  useEffect(() => {
    const currentCompletedDate = form.getValues('completed_date');
    if (isCompleted && !currentCompletedDate) {
      form.setValue('completed_date', new Date());
    } else if (!isCompleted && currentCompletedDate) {
      form.setValue('completed_date', null);
    }
  }, [isCompleted, form]);

  // Effect: Reset form when initialData or applicationId changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        type: initialData.type,
        application_id: String(initialData.application_id),
        scheduled_event_id: initialData.scheduled_event_id ? String(initialData.scheduled_event_id) : '',
        notes: initialData.notes || '',
        completed_date: initialData.completed_date ? new Date(initialData.completed_date) : null,
        is_completed: !!initialData.completed_date,
      });
    } else if (applicationId) {
      form.setValue('application_id', String(applicationId));
    }
  }, [initialData, applicationId, form]);

  // Submit handler
  async function onSubmit(values: ActionFormValues) {
    const parseId = (val?: string | null) => (val && val.trim() !== "") ? parseInt(val) : null;

    const payload = {
      type: values.type,
      application_id: parseInt(values.application_id),
      scheduled_event_id: parseId(values.scheduled_event_id),
      notes: values.notes || null,
      completed_date: values.is_completed && values.completed_date ? values.completed_date.toISOString() : null,
    };

    try {
      let resultAction: Action | undefined;

      if (initialData) {
        const result = await updateAction({ actionId: initialData.id, data: payload });
        resultAction = result as unknown as Action;
      } else {
        resultAction = await createAction({ data: payload });
      }

      form.reset();
      if (applicationId) form.setValue('application_id', String(applicationId));

      if (onSuccess) onSuccess(resultAction);
    } catch (err) {
      console.error("Error saving action", err);
    }
  }

  return {
    // Form
    form,
    onSubmit: form.handleSubmit(onSubmit),

    // State
    isCompleted,
    isEditing: !!initialData,
    isPending: isCreating || isUpdating,
    error: createError || updateError,

    // Data
    applications,
    isLoadingApps,
    eventsList,
    isLoadingEvents,
    currentApplication,

    // Refs
    applicationSelectTriggerRef,
  };
}

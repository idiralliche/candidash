import { useForm, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Target,
  CalendarClock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSwitch } from '@/components/ui/form-switch';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreateAction } from '@/hooks/actions/use-create-action';
import { useUpdateAction } from '@/hooks/actions/use-update-action';
import { useApplications } from '@/hooks/applications/use-applications';
import { useScheduledEvents } from '@/hooks/scheduled-events/use-scheduled-events';
import { Action } from '@/api/model';

// Zod Schema
const actionSchema = z.object({
  type: z.string({ required_error: 'Le type est requis' }).min(1, 'Le type est requis').max(50),
  application_id: z.string({ required_error: 'La candidature est requise' }).min(1, 'La candidature est requise'),
  scheduled_event_id: z.string().optional().or(z.literal('')),
  notes: z.string().max(5000).optional(),
  completed_date: z.date().optional().nullable(),
  // Virtual UI field to help with "completed" state
  is_completed: z.boolean().default(false),
});

type ActionFormValues = z.infer<typeof actionSchema>;

interface ActionFormProps {
  onSuccess?: () => void;
  className?: string;
  initialData?: Action;
}

export function ActionForm({ onSuccess, className, initialData }: ActionFormProps) {
  // Hooks
  const { mutate: createAction, isPending: isCreating, error: createError } = useCreateAction();
  const { mutate: updateAction, isPending: isUpdating, error: updateError } = useUpdateAction();

  // Data Loaders
  const { applications, isLoading: isLoadingApps } = useApplications();
  const { events, isLoading: isLoadingEvents } = useScheduledEvents();
  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  const form = useForm<ActionFormValues>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      type: initialData?.type || '',
      application_id: initialData?.application_id ? String(initialData.application_id) : '',
      scheduled_event_id: initialData?.scheduled_event_id ? String(initialData.scheduled_event_id) : '',
      notes: initialData?.notes || '',
      completed_date: initialData?.completed_date ? new Date(initialData.completed_date) : null,
      is_completed: !!initialData?.completed_date,
    },
  });

  // Sync is_completed switch with date field
  const isCompleted = useWatch({
    control: form.control,
    name: 'is_completed',
  });

  useEffect(() => {
    const currentCompletedDate = form.getValues('completed_date');
    if (isCompleted && !currentCompletedDate) {
      form.setValue('completed_date', new Date());
    } else if (!isCompleted && currentCompletedDate) {
      form.setValue('completed_date', null);
    }
  }, [isCompleted, form]);

  // Reset form when initialData changes
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
    }
  }, [initialData, form]);

  function onSubmit(values: ActionFormValues) {
    // Helper to handle empty strings as null
    const parseId = (val?: string | null) => (val && val.trim() !== "") ? parseInt(val) : null;

    const payload = {
      type: values.type,
      application_id: parseInt(values.application_id),
      scheduled_event_id: parseId(values.scheduled_event_id),
      notes: values.notes || null,
      // API expects ISO string or null
      completed_date: values.is_completed && values.completed_date ? values.completed_date.toISOString() : null,
    };

    const options = {
      onSuccess: () => {
        form.reset();
        if (onSuccess) onSuccess();
      }
    };

    if (isEditing && initialData) {
      updateAction({ actionId: initialData.id, data: payload }, options);
    } else {
      createAction({ data: payload }, options);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}>

        {/* --- CONTEXT --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Contexte</h3>

          <SmartFormField
            control={form.control}
            name="application_id"
            label="Candidature liée *"
            description="À quelle candidature cette action se rapporte-t-elle ?"
          >
            {(field) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingApps}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une candidature" />
                </SelectTrigger>
                <SelectContent>
                  {applications?.map((app) => (
                    <SelectItem key={app.id} value={app.id.toString()}>
                      {app.opportunity?.job_title} - {app.opportunity?.company?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </SmartFormField>

          <SmartFormField
            control={form.control}
            name="scheduled_event_id"
            label="Événement lié (Optionnel)"
          >
            {(field) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingEvents}
              >
                <SelectTrigger
                  className="w-full"
                  onClear={field.value ? () => field.onChange("") : undefined}
                >
                  <div className="flex items-center gap-2 truncate">
                    <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Lier à un événement de l'agenda" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {events?.map((evt) => (
                    <SelectItem key={evt.id} value={evt.id.toString()}>
                      {evt.title} ({new Date(evt.scheduled_date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </SmartFormField>
        </div>

        {/* --- DETAILS --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Détails de l'action</h3>

          <SmartFormField
            control={form.control}
            name="type"
            label="Type d'action *"
            component={Input}
            placeholder="Ex: Relance mail, Entretien RH..."
            leadingIcon={Target}
          />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">Fin d'action</h3>
            <SmartFormField
              control={form.control}
              name="is_completed"
            >
              {(field) => (
                <FormSwitch
                  {...field}
                  label="Action terminée ?"
                  description="Cochez si vous avez déjà réalisé cette action."
                />
              )}
            </SmartFormField>

            {isCompleted && (
                <SmartFormField
                    control={form.control}
                    name="completed_date"
                    label="Date de réalisation"
                >
                    {(field) => (
                        <DatePicker
                            date={field.value || undefined}
                            onSelect={field.onChange}
                        />
                    )}
                </SmartFormField>
            )}
          </div>

          <SmartFormField
            control={form.control}
            name="notes"
            label="Notes"
            component={Textarea}
            placeholder="Détails, compte-rendu ou prochaines étapes..."
            maxLength={5000}
            showCharCount
          />
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Une erreur est survenue lors de l'enregistrement.
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="sticky bottom-0">
          <Button
            type="submit"
            variant="solid"
            palette="primary"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Enregistrement..." : "Création..."}
                </>
            ) : (
                isEditing ? "Enregistrer les modifications" : "Ajouter l'action"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

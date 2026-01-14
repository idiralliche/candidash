import { useForm } from 'react-hook-form';
import {
  useEffect,
  useCallback,
} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Bell,
  Tag,
  Video,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import {
  addHours,
  startOfHour,
  format
} from 'date-fns';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreateScheduledEvent } from '@/hooks/scheduled-events/use-create-scheduled-event';
import { useUpdateScheduledEvent } from '@/hooks/scheduled-events/use-update-scheduled-event';
import {
  ScheduledEvent,
  EventStatus,
  CommunicationMethod,
} from '@/api/model';
import {
  LABELS_COMMUNICATION_METHOD,
  LABELS_EVENT_STATUS,
  getLabel,
} from '@/lib/dictionaries';

const eventSchema = z.object({
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

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  onSuccess?: () => void;
  className?: string;
  initialData?: ScheduledEvent;
  defaultDate?: Date;
}

export function EventForm({ onSuccess, className, initialData, defaultDate }: EventFormProps) {
  const { mutate: createEvent, isPending: isCreating, error: createError } = useCreateScheduledEvent();
  const { mutate: updateEvent, isPending: isUpdating, error: updateError } = useUpdateScheduledEvent();

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  const getDefaultDateTime = useCallback(() => {
    let dateObj = new Date();

    if (initialData?.scheduled_date) {
      dateObj = new Date(initialData.scheduled_date);
    } else if (defaultDate) {
      dateObj = new Date(defaultDate);
      const now = new Date();
      if (dateObj.toDateString() === now.toDateString()) {
         dateObj = startOfHour(addHours(now, 1));
      } else {
         dateObj.setHours(9, 0, 0, 0);
      }
    } else {
      dateObj = startOfHour(addHours(new Date(), 1));
    }

    return {
      date: dateObj,
      time: format(dateObj, 'HH:mm')
    };
  }, [initialData, defaultDate]);

  const defaults = getDefaultDateTime();

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

  // Reset effect
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

  function onSubmit(values: EventFormValues) {
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

    const options = {
      onSuccess: () => {
        form.reset();
        if (onSuccess) onSuccess();
      },
    };

    if (isEditing && initialData) {
      updateEvent({ eventId: initialData.id, data: payload }, options);
    } else {
      createEvent({ data: payload }, options);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className} pr-2 max-h-[80vh] overflow-y-auto`}>

        <SmartFormField
          control={form.control}
          name="title"
          label="Titre de l'événement *"
          component={Input}
          variant="form-blue"
          placeholder="Ex: Entretien RH, Appel découverte..."
          leadingIcon={Bell}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Date Picker via SmartFormField custom render */}
          <SmartFormField
            control={form.control}
            name="date"
            label="Date *"
          >
            {(field) => (
              <DatePicker
                date={field.value}
                onSelect={field.onChange}
                variant="form-blue"
              />
            )}
          </SmartFormField>

          <div className="flex gap-2">
             <div className="flex-1">
                <SmartFormField
                  control={form.control}
                  name="time"
                  label="Heure *"
                  component={Input}
                  type="time"
                  variant="form-blue"
                  leadingIcon={Clock}
                />
             </div>
             <div className="w-24">
                <SmartFormField
                  control={form.control}
                  name="duration_minutes"
                  label="Durée (min)"
                  component={Input}
                  type="number"
                  variant="form-blue"
                />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SmartFormField
            control={form.control}
            name="status"
            label="Statut *"
          >
            {(field) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <SelectTrigger variant="form-blue">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(LABELS_EVENT_STATUS).map((key) => (
                    <SelectItem key={key} value={key}>
                      {getLabel(LABELS_EVENT_STATUS, key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </SmartFormField>

          <SmartFormField
            control={form.control}
            name="event_type"
            label="Type"
            component={Input}
            variant="form-blue"
            placeholder="Ex: Technique, Fit..."
            leadingIcon={Tag}
          />
        </div>

        <SmartFormField
          control={form.control}
          name="communication_method"
          label="Moyen de communication"
        >
          {(field) => (
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <SelectTrigger
                  variant="form-blue"
                  onClear={field.value ? () => field.onChange(null) : undefined}
              >
                <SelectValue placeholder="Choisir..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(LABELS_COMMUNICATION_METHOD).map((key) => (
                  <SelectItem key={key} value={key}>
                    {getLabel(LABELS_COMMUNICATION_METHOD, key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </SmartFormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SmartFormField
            control={form.control}
            name="event_link"
            label="Lien (Visio)"
            component={Input}
            variant="form-blue"
            placeholder="https://..."
            leadingIcon={Video}
          />
          <SmartFormField
            control={form.control}
            name="phone_number"
            label="Téléphone"
            component={Input}
            variant="form-blue"
            placeholder="+33..."
            leadingIcon={Phone}
          />
        </div>

        <SmartFormField
          control={form.control}
          name="location"
          label="Lieu"
          component={Input}
          variant="form-blue"
          placeholder="Adresse..."
          leadingIcon={MapPin}
        />

        <SmartFormField
          control={form.control}
          name="instructions"
          label="Instructions"
          component={Textarea}
          variant="form-blue"
          placeholder="Code porte, étage..."
          maxLength={5000}
          showCharCount
        />

        <SmartFormField
          control={form.control}
          name="notes"
          label="Notes privées"
          component={Textarea}
          variant="form-blue"
          placeholder="..."
          maxLength={5000}
          showCharCount
        />

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de l'enregistrement.
          </div>
        )}

        <div className="sticky bottom-0">
          <Button
            type="submit"
            variant="solid"
            palette="blue"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Enregistrement..." : "Planification..."}
              </>
            ) : (
              isEditing ? "Enregistrer les modifications" : "Planifier l'événement"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

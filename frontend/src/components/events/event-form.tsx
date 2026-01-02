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
} from 'lucide-react';
import {
  addHours,
  startOfHour,
} from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreateScheduledEvent } from '@/hooks/use-create-scheduled-event';
import { useUpdateScheduledEvent } from '@/hooks/use-update-scheduled-event';
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
import { toLocalISOString } from '@/lib/utils.ts';

const eventSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  scheduled_date: z.string().min(1, "La date est requise"),
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

  const getDefaultDate = useCallback(() => {
    if (initialData?.scheduled_date) return toLocalISOString(initialData.scheduled_date);
    if (defaultDate) {
      const now = new Date();
      const isToday = defaultDate.toDateString() === now.toDateString();
      const baseDate = new Date(defaultDate);
      if (!isToday) {
          baseDate.setHours(9, 0, 0, 0);
      } else {
          baseDate.setHours(now.getHours() + 1, 0, 0, 0);
      }
      return toLocalISOString(baseDate.toISOString());
    }
    return toLocalISOString(startOfHour(addHours(new Date(), 1)).toISOString());
  }, [initialData, defaultDate]);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      scheduled_date: getDefaultDate(),
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

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        scheduled_date: toLocalISOString(initialData.scheduled_date),
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
    } else if (defaultDate) {
        form.setValue('scheduled_date', getDefaultDate());
    }
  }, [initialData, defaultDate, form, getDefaultDate]);

  function onSubmit(values: EventFormValues) {
    const isoDate = new Date(values.scheduled_date).toISOString();
    const payload = {
      ...values,
      scheduled_date: isoDate,
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
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Titre de l'événement *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Entretien RH, Appel découverte..."
                  leadingIcon={Bell}
                  className="focus:border-blue-500"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Date et Heure *</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    className="focus:border-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Durée (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="focus:border-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
           <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Statut *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-black-medium border-white-light text-white">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-surface-hover border-white-light text-white">
                    {Object.keys(LABELS_EVENT_STATUS).map((key) => (
                      <SelectItem key={key} value={key}>
                        {getLabel(LABELS_EVENT_STATUS, key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="event_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Type</FormLabel>
                <FormControl>
                   <Input
                    placeholder="Ex: Technique, Fit..."
                    leadingIcon={Tag}
                    className="focus:border-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Communication Method */}
        <FormField
          control={form.control}
          name="communication_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Moyen de communication</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="bg-black-medium border-white-light text-white">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-surface-hover border-white-light text-white">
                  {Object.keys(LABELS_COMMUNICATION_METHOD).map((key) => (
                    <SelectItem key={key} value={key}>
                      {getLabel(LABELS_COMMUNICATION_METHOD, key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
            control={form.control}
            name="event_link"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-white">Lien (Visio)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://..."
                    leadingIcon={Video}
                    className="focus:border-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-white">Téléphone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+33..."
                    leadingIcon={Phone}
                    className="focus:border-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
            <FormItem>
                <FormLabel className="text-white">Lieu</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Adresse..."
                    leadingIcon={MapPin}
                    className="focus:border-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
            <FormItem>
                <FormLabel className="text-white">Instructions</FormLabel>
                <FormControl>
                  <Textarea placeholder="Code porte, étage..." {...field} className="bg-black-medium border-white-light text-white focus:border-blue-500" />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
            <FormItem>
                <FormLabel className="text-white">Notes privées</FormLabel>
                <FormControl>
                  <Textarea placeholder="..." {...field} className="bg-black-medium border-white-light text-white focus:border-blue-500" />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />


        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de l'enregistrement.
          </div>
        )}

        <div className="sticky bottom-0">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
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

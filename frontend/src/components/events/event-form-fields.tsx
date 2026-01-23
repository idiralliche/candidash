import { Control } from 'react-hook-form';
import {
  Bell,
  Tag,
  Video,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';

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

import {
  LABELS_COMMUNICATION_METHOD,
  LABELS_EVENT_STATUS,
  getLabel,
} from '@/lib/dictionaries';
import { EventFormValues } from '@/hooks/scheduled-events/use-event-form-logic';

interface EventFormFieldsProps {
  control: Control<EventFormValues>;
}

export function EventFormFields({ control }: EventFormFieldsProps) {
  return (
    <>
      <SmartFormField
        control={control}
        name="title"
        label="Titre de l'événement *"
        component={Input}
        variant="form-blue"
        placeholder="Ex: Entretien RH, Appel découverte..."
        leadingIcon={Bell}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SmartFormField
          control={control}
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
                control={control}
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
                control={control}
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
          control={control}
          name="status"
          label="Statut *"
        >
          {(field) => (
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
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
          control={control}
          name="event_type"
          label="Type"
          component={Input}
          variant="form-blue"
          placeholder="Ex: Technique, Fit..."
          leadingIcon={Tag}
        />
      </div>

      <SmartFormField
        control={control}
        name="communication_method"
        label="Moyen de communication"
      >
        {(field) => (
          <Select
            onValueChange={field.onChange}
            value={field.value || ""}
          >
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
          control={control}
          name="event_link"
          label="Lien (Visio)"
          component={Input}
          variant="form-blue"
          placeholder="https://..."
          leadingIcon={Video}
        />
        <SmartFormField
          control={control}
          name="phone_number"
          label="Téléphone"
          component={Input}
          variant="form-blue"
          placeholder="+33..."
          leadingIcon={Phone}
        />
      </div>

      <SmartFormField
        control={control}
        name="location"
        label="Lieu"
        component={Input}
        variant="form-blue"
        placeholder="Adresse..."
        leadingIcon={MapPin}
      />

      <SmartFormField
        control={control}
        name="instructions"
        label="Instructions"
        component={Textarea}
        variant="form-blue"
        placeholder="Code porte, étage..."
        maxLength={5000}
        showCharCount
      />

      <SmartFormField
        control={control}
        name="notes"
        label="Notes privées"
        component={Textarea}
        variant="form-blue"
        placeholder="..."
        maxLength={5000}
        showCharCount
      />
    </>
  );
}

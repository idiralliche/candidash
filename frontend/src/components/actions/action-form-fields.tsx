import { RefObject } from 'react';
import {
  Control,
  UseFormRegister,
} from 'react-hook-form';
import {
  Target,
  CalendarClock,
  Layers,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSwitch } from '@/components/ui/form-switch';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import { SmartSelect } from '@/components/ui/smart-select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Application,
  ScheduledEvent
} from '@/api/model';
import { ActionFormValues } from '@/hooks/actions/use-action-form-logic';

interface ActionFormFieldsProps {
  control: Control<ActionFormValues>;
  register: UseFormRegister<ActionFormValues>;
  // Context Data
  applications?: Application[];
  isLoadingApps?: boolean;
  eventsList?: ScheduledEvent[];
  isLoadingEvents?: boolean;
  currentApplication?: Application | null;
  // UI State
  isCompleted: boolean;
  preselectedApplicationId?: number | null;
  applicationSelectRef?: RefObject<HTMLButtonElement | null>;
}

export function ActionFormFields({
  control,
  register,
  applications,
  isLoadingApps,
  eventsList,
  isLoadingEvents,
  currentApplication,
  isCompleted,
  preselectedApplicationId,
  applicationSelectRef,
}: ActionFormFieldsProps) {
  return (
    <>
      {/* --- CONTEXT --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Contexte</h3>

        {/* Application */}
        {preselectedApplicationId ? ( // pre-selected in wizard form
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-200">
              Candidature liée
            </label>

            <Card className="p-3 border-white-light/10 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {currentApplication?.opportunity?.job_title || "Chargement..."}
                </span>
                <span className="text-xs text-gray-400">
                  {currentApplication?.opportunity?.company?.name}
                </span>
              </div>
            </Card>

            <input type="hidden" {...register('application_id')} />
          </div>
        ) : (
          <SmartFormField
            control={control}
            name="application_id"
            label="Candidature liée *"
            description="À quelle candidature cette action se rapporte-t-elle ?"
          >
            <SmartSelect
              disabled={isLoadingApps}
              ref={applicationSelectRef}
              autoFocus={false}
              placeholder={{topic: "candidature", suffix: "e"}}
              items={applications?.map(app => ({
                key: app.id,
                value: app.id.toString(),
                label: `${app.opportunity?.job_title} - ${app.opportunity?.company?.name}`,
              }))}
            />
          </SmartFormField>
        )}

        {/* Scheduled Event */}
        <SmartFormField
          control={control}
          name="scheduled_event_id"
          label="Événement lié (Optionnel)"
        >
          <SmartSelect
            disabled={isLoadingEvents}
            isOptional
            icon={CalendarClock}
            placeholder="Lier à un événement de l'agenda"
            items={eventsList?.map(evt => ({
              key: evt.id,
              value: evt.id.toString(),
              label: `${evt.title} (${new Date(evt.scheduled_date).toLocaleDateString()})`
            }))}
          />
        </SmartFormField>
      </div>

      {/* --- DETAILS --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Détails de l'action</h3>

        {/* Action Type */}
        <SmartFormField
          control={control}
          name="type"
          label="Type d'action *"
          component={Input}
          placeholder="Ex: Relance mail, Entretien RH..."
          leadingIcon={Target}
          autoFocus={false}
        />

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-primary">Fin d'action</h3>

          {/* Mark as Completed (UI helper not in model) */}
          <SmartFormField
            control={control}
            name="is_completed"
          >
            <FormSwitch
              label="Action terminée ?"
              description="Cochez si vous avez déjà réalisé cette action."
            />
          </SmartFormField>

          {/* Completed Date */}
          {isCompleted && (
            <SmartFormField
              control={control}
              name="completed_date"
              label="Date de réalisation"
            >
              <DatePicker />
            </SmartFormField>
          )}
        </div>

        {/* Notes */}
        <SmartFormField
          control={control}
          name="notes"
          label="Notes"
          component={Textarea}
          placeholder="Détails, compte-rendu ou prochaines étapes..."
          maxLength={5000}
          showCharCount
        />
      </div>
    </>
  );
}

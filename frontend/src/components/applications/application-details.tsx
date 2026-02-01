import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Calendar, Archive } from "lucide-react";

import { Application } from "@/api/model";

import {
  LABELS_APPLICATION_STATUS,
  getLabel,
} from '@/lib/dictionaries';
import { getApplicationStatusPalette } from '@/lib/semantic-ui';

import { Badge } from "@/components/ui/badge";
import { ApplicationDetailsContent } from '@/components/applications/application-details-content'
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import { DetailsMetaInfoBlock } from "@/components/shared/details-meta-info-block";

interface ApplicationDetailsProps {
  application: Application;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
}

export function ApplicationDetails({
  application,
  onEdit,
  onDelete
}: ApplicationDetailsProps) {
  const applicationDate = new Date(application.application_date);
  const opportunity = application.opportunity;

  return (
    <EntityDetailsSheet
      entityName="candidature"
      onDelete={() => onDelete(application)}
    >
      <EntityDetailsSheet.Header>
        <EntityDetailsSheet.Badges>
          <Badge
            variant="subtle"
            palette={getApplicationStatusPalette(application.status)}
          >
            {getLabel(LABELS_APPLICATION_STATUS, application.status)}
          </Badge>

          {application.is_archived && (
            <Badge
              variant="subtle"
              palette="yellow"
            >
              <Archive className="h-3 w-3" />
              Archivée
            </Badge>
          )}
        </EntityDetailsSheet.Badges>

        <EntityDetailsSheet.TitleRow
          title={opportunity?.job_title || "Détail de la candidature"}
          onEdit={() => onEdit(application)}
        />

        <EntityDetailsSheet.Metadata>
          <DetailsMetaInfoBlock
            icon={Calendar}
            label={format(applicationDate, 'dd MMMM yyyy', { locale: fr })}
          />
        </EntityDetailsSheet.Metadata>
      </EntityDetailsSheet.Header>

      <ApplicationDetailsContent
        application={application}
        opportunity={opportunity}
      />
    </EntityDetailsSheet>
  );
}

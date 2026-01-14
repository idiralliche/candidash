import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Briefcase,
  Calendar,
  Trash2,
  FileText,
  AlertTriangle,
  Banknote,
  Mail,
  Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LinkCard } from "@/components/shared/link-card";

import { Application } from "@/api/model";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import { DetailsBlock } from "@/components/shared/details-block";

import {
  LABELS_APPLICATION_STATUS,
  getLabel,
} from '@/lib/dictionaries';
import { getApplicationStatusPalette } from '@/lib/semantic-ui';
import { useDownloadDocument } from '@/hooks/use-download-document';

interface ApplicationDetailsProps {
  application: Application;
  onEdit?: (app: Application) => void;
  onDelete?: (app: Application) => void;
}

export function ApplicationDetails({
  application,
  onEdit,
  onDelete
}: ApplicationDetailsProps) {
  const applicationDate = new Date(application.application_date);
  const { downloadDocument, isDownloading } = useDownloadDocument();

  const opportunity = application.opportunity;
  const resume = application.resume_used;
  const coverLetter = application.cover_letter;

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <EntityDetailsSheet
      title={opportunity?.job_title || "Détail de la candidature"}
      badge={
        <div className="flex justify-start gap-2">
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
              <Archive className="mr-2 h-3 w-3" />
              Archivée
            </Badge>
          )}
        </div>
      }
      metadata={
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Calendar className="h-4 w-4" />
          {format(applicationDate, 'dd MMMM yyyy', { locale: fr })}
        </div>
      }
      onEdit={onEdit ? () => onEdit(application) : undefined}
      footer={
        onDelete && (
           <Button variant="ghost" palette="destructive" className="w-full" onClick={() => onDelete(application)}>
             <Trash2 className="mr-2 h-4 w-4" />
             Supprimer la candidature
           </Button>
        )
      }
    >
      {/* OPPORTUNITY CONTEXT */}
      <div className="mb-6">
        {opportunity ? (
          <Button
            variant="outline"
            palette="blue"
            className="w-full justify-start"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Voir l'opportunité
          </Button>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-md bg-orange-50 border border-orange-100 text-orange-800 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold">Opportunité introuvable</span>
              <span className="text-xs opacity-90">
                L'opportunité associée n'a pas pu être chargée.
              </span>
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-white-light mb-6" />

      {/* SALARY EXPECTATIONS */}
      {application.salary_expectation && (
        <>
          <DetailsBlock icon={Banknote} label="Prétentions Salariales">
            {formatSalary(application.salary_expectation)}
          </DetailsBlock>
          <Separator className="bg-white-light mb-6 mt-6" />
        </>
      )}

      {/* DOCUMENTS SECTION */}
      {(resume || coverLetter) && (
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2 select-none">
            <FileText className="h-3 w-3" />
            Documents joints
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {resume && (
              <LinkCard
                icon={FileText}
                label="Curriculum Vitae"
                value={resume.name}
                onClick={() => downloadDocument(resume)}
                isLoading={isDownloading}
                variant="blue"
                isExternal={resume.is_external}
              />
            )}

            {coverLetter && (
              <LinkCard
                icon={Mail}
                label="Lettre de Motivation"
                value={coverLetter.name}
                onClick={() => downloadDocument(coverLetter)}
                isLoading={isDownloading}
                variant="default"
                isExternal={coverLetter.is_external}
              />
            )}
          </div>
        </div>
      )}
    </EntityDetailsSheet>
  );
}

import {
  FileText,
  MailPlus,
  FilePlusCorner,
  MailX,
  FileXCorner,
 } from 'lucide-react';
import { toast } from 'sonner';
import { DocumentForm } from '@/components/documents/document-form';
import { DocumentCard } from '@/components/documents/document-card';
import { WizardStepGeneric } from '@/components/wizard/wizard-step-generic';
import { useDeleteDocument } from '@/hooks/documents/use-delete-document';
import { useUpdateApplication } from '@/hooks/applications/use-update-application';
import { Document } from '@/api/model';
import { Badge } from '@/components/ui/badge';
import { Switch } from "@/components/ui/switch";

interface WizardStepDocumentsProps {
  applicationId: number | null;
  documents: Document[];
  onDocumentAdded: (doc: Document) => void;
  onDocumentRemoved: (docId: number) => void;
  resumeDocumentId: number | null;
  coverLetterDocumentId: number | null;
  onSetResume: (docId: number | null) => void;
  onSetCoverLetter: (docId: number | null) => void;
}

interface DocumentExtraProps {
  applicationId: number | null;
  resumeDocumentId: number | null;
  coverLetterDocumentId: number | null;
  onToggleResume: (doc: Document) => void;
  onToggleCoverLetter: (doc: Document) => void;
  isUpdatingApp: boolean;
}

export function WizardStepDocuments({
  applicationId,
  documents = [],
  onDocumentAdded,
  onDocumentRemoved,
  resumeDocumentId,
  coverLetterDocumentId,
  onSetResume,
  onSetCoverLetter
}: WizardStepDocumentsProps) {
  const { mutateAsync: updateApplication, isPending: isUpdatingApp } = useUpdateApplication();

  const handleToggleResume = async (doc: Document) => {
    if (!applicationId) return;

    const isCurrentlyResume = resumeDocumentId === doc.id;
    const newValue = isCurrentlyResume ? null : doc.id;

    try {
      await updateApplication({
        applicationId,
        data: { resume_used_id: newValue }
      });
      onSetResume(newValue);
      if (newValue) toast.success("Document défini comme CV");
      else toast.info("Document retiré du CV");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour du CV");
    }
  };

  const handleToggleCoverLetter = async (doc: Document) => {
    if (!applicationId) return;

    const isCurrentlyCoverLetter = coverLetterDocumentId === doc.id;
    const newValue = isCurrentlyCoverLetter ? null : doc.id;

    try {
      await updateApplication({
        applicationId,
        data: { cover_letter_id: newValue }
      });
      onSetCoverLetter(newValue);
      if (newValue) toast.success("Document défini comme Lettre de Motivation");
      else toast.info("Document retiré de la Lettre de Motivation");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour de la Lettre de Motivation");
    }
  };

  const renderDocument = (
    doc: Document,
    onDelete: (doc: Document) => void,
    extraProps: DocumentExtraProps
  ) => {
    const isResume = extraProps.resumeDocumentId === doc.id;
    const isCoverLetter = extraProps.coverLetterDocumentId === doc.id;

    return (
      <DocumentCard
        document={doc}
        onDelete={() => onDelete(doc)}
        isResume={isResume}
        isCoverLetter={isCoverLetter}
        customActions={extraProps.applicationId && (
          <Badge
            variant="outline"
            palette="red"
            className="flex flex-col items-center"
          >
            <div
              key="resume"
              className="flex flex-row items-center justify-between p-2 gap-2"
              title={isResume ? "Dissocier en tant que CV" : "Associer en tant que CV"}
            >
              <label className={`text-sm flex justify-between items-center ${isResume ? "text-primary line-through" : ""}`}>
                {isResume ? (
                  <>
                    <FileXCorner className="mr-2 h-4 w-4" />
                    Dissocier
                  </>
                ) : (
                  <>
                    <FilePlusCorner className="mr-2 h-4 w-4" />
                    Associer
                  </>
                )}
                &nbsp;CV
              </label>
              <Switch
                checked={isResume}
                onCheckedChange={() => extraProps.onToggleResume(doc)}
                disabled={extraProps.isUpdatingApp}
              />
            </div>
            <div
              key="coverLetter"
              className="flex flex-row items-center justify-between p-2 gap-2"
              title={isCoverLetter ? "Dissocier en tant que lettre de motivation" : "Associer en tant que lettre de motivation"}
            >
              <label className={`text-sm flex justify-between items-center ${isCoverLetter ? "text-primary line-through" : ""}`}>
                {isCoverLetter ? (
                  <>
                    <MailX className="mr-2 h-4 w-4" />
                    Dissocier
                  </>
                ) : (
                  <>

                  <MailPlus className="mr-2 h-4 w-4" />
                    Associer
                  </>
                )}
                &nbsp;LM
              </label>
              <Switch
                checked={isCoverLetter}
                onCheckedChange={() => extraProps.onToggleCoverLetter(doc)}
                disabled={extraProps.isUpdatingApp}
              />
            </div>
          </Badge>
        )}
      />
    );
  };

  const config = {
    title: "Documents",
    entityName: "Document",
    entityNamePlural: "Documents",
    icon: FileText,
    emptyMessage: "Aucun document ajouté. Ajoutez des CV, lettres de motivation ou autres fichiers pour cette candidature.",
    addButtonText: "Ajouter un document",

    formComponent: DocumentForm,
    deleteHook: useDeleteDocument,
    getDeletePayload: (id: number) => ({ documentId: id }),
    getEntityLabel: (doc: Document) => doc.name,

    renderEntity: renderDocument,
    onSuccess: onDocumentAdded,
    onRemove: onDocumentRemoved,
    extraProps: {
      applicationId,
      resumeDocumentId,
      coverLetterDocumentId,
      onToggleResume: handleToggleResume,
      onToggleCoverLetter: handleToggleCoverLetter,
      isUpdatingApp
    }
  };

  return (
    <WizardStepGeneric<Document, { documentId: number }, DocumentExtraProps>
      entities={documents}
      config={config}
    />
  );
}

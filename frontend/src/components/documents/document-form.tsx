import {
  UploadCloud,
  Link as LinkIcon,
  Save,
  Info,
} from 'lucide-react';
import { SmartForm } from '@/components/shared/smart-form';
import { Input } from '@/components/ui/input';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Document } from '@/api/model';
import { useDocumentFormLogic } from '@/hooks/documents/use-document-form-logic';
import { SharedDocumentFields } from '@/components/documents/document-form-fields';
import { FileUploader } from '@/components/ui/file-uploader'

interface DocumentFormProps {
  onSuccess: (document?: Document) => void;
  initialData?: Document;
}

export function DocumentForm({ onSuccess, initialData }: DocumentFormProps) {

  const logic = useDocumentFormLogic({ initialData, onSuccess });

  return (
    <Tabs
      value={logic.tab}
      onValueChange={(v) => logic.setTab(v as 'upload' | 'external')}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 bg-surface-base border border-white-light">
        <TabsTrigger
          value="upload"
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
            <UploadCloud className="h-4 w-4 mr-2"/> Fichier Local
        </TabsTrigger>
        <TabsTrigger
          value="external"
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
            <LinkIcon className="h-4 w-4 mr-2"/> Lien Externe
        </TabsTrigger>
      </TabsList>

      {/* --- TAB: UPLOAD (Local) --- */}
      <TabsContent value="upload" className="mt-4">
        <SmartForm
          form={logic.uploadForm}
          onSubmit={logic.onUploadSubmit}
          isEditing={logic.isEditing}
          entityType="document"
          editLabel={
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer / Convertir
            </>
          }
        >
          {/* DROPZONE AREA */}
          {!logic.isLocalEdit ? (
            <SmartFormField
              control={logic.uploadForm.control}
              name="file"
              label={logic.isEditing ? "Nouveau fichier (Remplacement) *" : "Fichier *"}
            >
              <FileUploader isEditing={logic.isEditing} />
            </SmartFormField>
          ) : (
            <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-200 py-2">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs ml-2">
                Le fichier ne peut pas être remplacé directement ici.
                Pour changer le fichier, supprimez ce document et créez-en un nouveau.
              </AlertDescription>
            </Alert>
          )}

          <SharedDocumentFields control={logic.uploadForm.control} />

        </SmartForm>
      </TabsContent>

      {/* --- TAB: EXTERNAL (Link) --- */}
      <TabsContent value="external" className="mt-4">
        <SmartForm
          form={logic.externalForm}
          onSubmit={logic.onExternalSubmit}
          isEditing={logic.isEditing}
          entityType="lien"
          editLabel={
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer / Convertir
            </>
          }
        >
          <SmartFormField
            control={logic.externalForm.control}
            name="path"
            label="URL du document *"
            component={Input}
            placeholder="https://docs.google.com/..."
            leadingIcon={LinkIcon}
            description={logic.isEditing && !logic.isExternalOrigin ? "Attention : Le fichier local actuel sera supprimé et remplacé par ce lien." : undefined}
          />

          <SharedDocumentFields control={logic.externalForm.control} />

        </SmartForm>
      </TabsContent>
    </Tabs>
  );
}

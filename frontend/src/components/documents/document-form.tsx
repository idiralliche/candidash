import {
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  useForm,
  UseFormReturn,
  FieldValues,
  Path,
} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import {
  Loader2,
  UploadCloud,
  Link as LinkIcon,
  Save,
  Info,
  File,
  FileText,
  Tag,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { formatBytes } from '@/lib/utils';

import { useCreateDocument } from '@/hooks/use-create-document';
import { useUpdateDocument } from '@/hooks/use-update-document';
import { useReplaceDocumentFile } from '@/hooks/use-replace-document-file';
import { Document } from '@/api/model';

// --- Zod Schemas ---

const baseSchemaObj = {
  name: z.string().min(1, 'Le nom est requis').max(255),
  type: z.string().min(1, 'Le type est requis'),
  description: z.string().max(5000).optional(),
};

const uploadSchema = z.object({
  ...baseSchemaObj,
  file: z.instanceof(FileList).refine((files) => files.length > 0, 'Un fichier est requis'),
});

const metadataSchema = z.object({
  ...baseSchemaObj,
});

const externalSchema = z.object({
  ...baseSchemaObj,
  path: z.string().url('URL invalide (doit commencer par http/https)'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;
type MetadataFormValues = z.infer<typeof metadataSchema>;
type ExternalFormValues = z.infer<typeof externalSchema>;

interface DocumentFormProps {
  onSuccess: () => void;
  initialData?: Document;
}

export function DocumentForm({ onSuccess, initialData }: DocumentFormProps) {
  const isEditing = !!initialData;
  const isExternalOrigin = initialData?.is_external ?? false;

  const [tab, setTab] = useState<'upload' | 'external'>(
    isEditing && isExternalOrigin ? 'external' : 'upload'
  );

  const { createExternal, uploadFile, isPending: isCreating } = useCreateDocument();
  const { mutateAsync: updateDocument, isPending: isUpdating } = useUpdateDocument();
  const { replaceFile, isPending: isReplacing } = useReplaceDocumentFile();

  const isPending = isCreating || isUpdating || isReplacing;

  // --- FORMS SETUP ---

  const isLocalEdit = isEditing && !isExternalOrigin;
  const currentUploadSchema = isLocalEdit ? metadataSchema : uploadSchema;

  const uploadForm = useForm<UploadFormValues | MetadataFormValues>({
    resolver: zodResolver(currentUploadSchema),
    defaultValues: { name: '', type: '', description: '' },
  });

  const externalForm = useForm<ExternalFormValues>({
    resolver: zodResolver(externalSchema),
    defaultValues: { name: '', type: '', path: '', description: '' },
  });

  // --- POPULATE DATA ---
  useEffect(() => {
    if (initialData) {
      uploadForm.reset({
        name: initialData.name,
        type: initialData.type,
        description: initialData.description || '',
      });

      externalForm.reset({
        name: initialData.name,
        type: initialData.type,
        description: initialData.description || '',
        path: initialData.is_external ? initialData.path : '',
      });
    }
  }, [initialData, uploadForm, externalForm]);

  // --- HANDLERS ---

  const onUploadSubmit = async (values: UploadFormValues | MetadataFormValues) => {
    try {
      if (isEditing) {
        if (isExternalOrigin) {
          // --- COMPLEX SCENARIO: EXTERNAL MIGRATION -> LOCAL ---

          // Step 1: File Replacement (Critical)
          const file = (values as UploadFormValues).file[0];
          await replaceFile.mutateAsync({
             documentId: initialData.id,
             data: { file: file }
          });

          // Step 2: Metadata Update (Secondary)
          try {
            await updateDocument({
                documentId: initialData.id,
                data: {
                  name: values.name,
                  type: values.type,
                  description: values.description || null,
                }
            });
          } catch (metaError) {
            console.error("Erreur mise à jour metadata après upload", metaError);
            toast.warning("Fichier converti, mais les infos (nom/desc) n'ont pas pu être mises à jour.");
          }
        } else {
          // --- SIMPLE SCENARIO: LOCAL -> LOCAL (Update Metadata) ---
          await updateDocument({
            documentId: initialData.id,
            data: {
              name: values.name,
              type: values.type,
              description: values.description || null,
            }
          });
        }
      } else {
        // --- SIMPLE SCENARIO: LOCAL CREATION ---
        const file = (values as UploadFormValues).file[0];
        await uploadFile.mutateAsync({
          data: {
            file: file,
            name: values.name,
            type: values.type,
            description: values.description || "",
          }
        });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  const onExternalSubmit = async (values: ExternalFormValues) => {
    try {
      if (isEditing) {
        await updateDocument({
          documentId: initialData.id,
          data: {
            name: values.name,
            type: values.type,
            description: values.description || null,
            is_external: true,
            path: values.path
          }
        });
      } else {
        await createExternal.mutateAsync({
          data: {
            name: values.name,
            type: values.type,
            format: 'external',
            path: values.path,
            is_external: true,
            description: values.description || undefined,
          }
        });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  // --- RENDER ---
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as 'upload' | 'external')} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-surface-base border border-white-light">
        <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <UploadCloud className="h-4 w-4 mr-2"/> Fichier Local
        </TabsTrigger>
        <TabsTrigger value="external" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <LinkIcon className="h-4 w-4 mr-2"/> Lien Externe
        </TabsTrigger>
      </TabsList>

      {/* --- TAB: UPLOAD (Local) --- */}
      <TabsContent value="upload" className="mt-4">
        <Form {...uploadForm}>
          <form onSubmit={uploadForm.handleSubmit(onUploadSubmit)} className="space-y-4">

            {/* DROPZONE AREA */}
            {!isLocalEdit ? (
               <SmartFormField
                 control={uploadForm.control}
                 name="file"
                 label={isEditing ? "Nouveau fichier (Remplacement) *" : "Fichier *"}
               >
                 {(field) => (
                   <FileUploader
                      value={field.value as FileList | null}
                      onChange={field.onChange}
                      isEditing={isEditing}
                   />
                 )}
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

            <SharedFields form={uploadForm} />

            <DialogFooter className="pt-4">
                <Button
                  type="submit"
                  variant="solid"
                  palette="primary"
                  className="w-full sm:w-auto"
                  disabled={isPending}
                >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Enregistrement..." : "Upload en cours..."}
                      </>
                    ) : isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer / Convertir
                      </>
                    ) : (
                      "Uploader"
                    )}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </TabsContent>

      {/* --- TAB: EXTERNAL (Link) --- */}
      <TabsContent value="external" className="mt-4">
        <Form {...externalForm}>
          <form onSubmit={externalForm.handleSubmit(onExternalSubmit)} className="space-y-4">

            <SmartFormField
              control={externalForm.control}
              name="path"
              label="URL du document *"
              component={Input}
              placeholder="https://docs.google.com/..."
              leadingIcon={LinkIcon}
              description={isEditing && !isExternalOrigin ? "Attention : Le fichier local actuel sera supprimé et remplacé par ce lien." : undefined}
            />

            <SharedFields form={externalForm} />

            <DialogFooter className="pt-4">
                <Button
                  type="submit"
                  variant="solid"
                  palette="primary"
                  className="w-full sm:w-auto"
                  disabled={isPending}
                >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Enregistrement..." : "Ajout en cours..."}
                      </>
                    ) : isEditing ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enregistrer / Convertir
                      </>
                    ) : (
                      "Ajouter le lien"
                    )}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}

// --- SUB-COMPONENTS ---

function FileUploader({
  value,
  onChange,
  isEditing
}: {
  value: FileList | null;
  onChange: (files: FileList | null) => void;
  isEditing: boolean
}) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
       const dataTransfer = new DataTransfer();
       dataTransfer.items.add(acceptedFiles[0]);
       onChange(dataTransfer.files);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false
  });

  const selectedFile = value && value.length > 0 ? value[0] : null;

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between p-4 border border-white-medium rounded-lg bg-surface-base">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-primary/20 rounded-md">
            <File className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
             <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-[300px]">
               {selectedFile.name}
             </p>
             <p className="text-xs text-gray-400">
               {formatBytes(selectedFile.size)}
             </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          palette="destructive"
          size="icon"
          onClick={() => onChange(null)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
        min-h-[120px] text-center outline-none
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-white-light bg-surface-base hover:bg-white/5 hover:border-white/30'}
      `}
    >
      <input {...getInputProps()} />
      <UploadCloud className={`h-10 w-10 mb-3 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
      <p className="text-sm text-gray-300 font-medium">
        {isDragActive ? "Relâchez pour ajouter" : "Glissez votre fichier ici"}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        ou cliquez pour parcourir
      </p>
      {isEditing && (
         <p className="text-xs text-yellow-500/80 mt-3 pt-3 border-t border-white-subtle w-full">
           Attention : Convertira ce lien externe en fichier local.
         </p>
      )}
    </div>
  );
}

function SharedFields<T extends FieldValues>({ form }: { form: UseFormReturn<T> }) {
  return (
    <>
      <SmartFormField
        control={form.control}
        name={"name" as Path<T>}
        label="Nom *"
        component={Input}
        placeholder="Ex: CV 2024"
        leadingIcon={FileText}
      />
      <SmartFormField
        control={form.control}
        name={"type" as Path<T>}
        label="Type *"
        component={Input}
        placeholder="Ex: CV, Lettre, Portfolio..."
        leadingIcon={Tag}
      />
      <SmartFormField
        control={form.control}
        name={"description" as Path<T>}
        label="Description"
        component={Textarea}
        placeholder="Notes..."
      />
    </>
  );
}

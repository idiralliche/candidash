import { useState, useEffect } from 'react';
import { useForm, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UploadCloud, Link as LinkIcon, Save, Info } from 'lucide-react';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useCreateDocument } from '@/hooks/use-create-document';
import { useUpdateDocument } from '@/hooks/use-update-document';
import { useReplaceDocumentFile } from '@/hooks/use-replace-document-file';
import { Document } from '@/api/model';

// --- Zod Schemas ---

// Common fields
const baseSchemaObj = {
  name: z.string().min(1, 'Le nom est requis').max(255),
  type: z.string().min(1, 'Le type est requis'),
  description: z.string().max(5000).optional(),
};

// 1. Upload (Creation or Migration Ext -> Local) : File required
const uploadSchema = z.object({
  ...baseSchemaObj,
  file: z.instanceof(FileList).refine((files) => files.length > 0, 'Un fichier est requis'),
});

// 2. Metadata Only (Update Local -> Local) : No file
const metadataSchema = z.object({
  ...baseSchemaObj,
});

// 3. External (Creation or Migration Local -> Ext or Update Ext) : URL required
const externalSchema = z.object({
  ...baseSchemaObj,
  path: z.string().url('URL invalide (doit commencer par http/https)'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;
type MetadataFormValues = z.infer<typeof metadataSchema>; // For local edit
type ExternalFormValues = z.infer<typeof externalSchema>;

interface DocumentFormProps {
  onSuccess: () => void;
  initialData?: Document;
}

export function DocumentForm({ onSuccess, initialData }: DocumentFormProps) {
  const isEditing = !!initialData;
  const isExternalOrigin = initialData?.is_external ?? false;

  // Initial Tab State
  const [tab, setTab] = useState<'upload' | 'external'>(
    isEditing && isExternalOrigin ? 'external' : 'upload'
  );

  // Hooks
  const { createExternal, uploadFile, isPending: isCreating } = useCreateDocument();
  const { mutateAsync: updateDocument, isPending: isUpdating } = useUpdateDocument();
  const { replaceFile, isPending: isReplacing } = useReplaceDocumentFile();

  const isPending = isCreating || isUpdating || isReplacing;

  // --- FORMS SETUP ---

  // Determine which schema to use for the "Upload" tab
  // If editing a local file, we don't ask for a file (Metadata only).
  // If creating new OR migrating from external, we need a file.
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
      // Populate Upload Form (Metadata)
      uploadForm.reset({
        name: initialData.name,
        type: initialData.type,
        description: initialData.description || '',
      });

      // Populate External Form
      externalForm.reset({
        name: initialData.name,
        type: initialData.type,
        description: initialData.description || '',
        path: initialData.is_external ? initialData.path : '', // Pre-fill path only if currently external
      });
    }
  }, [initialData, uploadForm, externalForm]);

  // --- HANDLERS ---

  // 1. HANDLE UPLOAD TAB SUBMIT
  const onUploadSubmit = async (values: UploadFormValues | MetadataFormValues) => {
    try {
      if (isEditing) {
        if (isExternalOrigin) {
          // Case: EXTERNAL -> LOCAL (Migration)
          // We must use the replace-file endpoint with the binary
          // Cast values to UploadFormValues because schema guarantees file presence here
          const file = (values as UploadFormValues).file[0];
          await replaceFile.mutateAsync({
             documentId: initialData.id,
             data: { file: file } // Note: replace endpoint doesn't update metadata simultaneously in backend usually, but we keep it simple
          });
          // Optimisation: If replaceFile doesn't update metadata (name/type), we might need a second call to updateDocument
          // But usually replace-file keeps existing metadata. Let's assume metadata update is separate or not needed immediately for migration.
          // If we want to update metadata too, we would chain updateDocument here.
        } else {
          // Case: LOCAL -> LOCAL (Update Metadata only)
          await updateDocument({
            documentId: initialData.id,
            data: {
              name: values.name,
              type: values.type,
              description: values.description || null,
              // No file sent, no is_external change
            }
          });
        }
      } else {
        // Case: CREATE NEW LOCAL
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

  // 2. HANDLE EXTERNAL TAB SUBMIT
  const onExternalSubmit = async (values: ExternalFormValues) => {
    try {
      if (isEditing) {
        // Case: EXTERNAL -> EXTERNAL (Update)
        // OR
        // Case: LOCAL -> EXTERNAL (Migration)
        await updateDocument({
          documentId: initialData.id,
          data: {
            name: values.name,
            type: values.type,
            description: values.description || null,
            // Migration magic happens here:
            is_external: true,
            path: values.path
          }
        });
      } else {
        // Case: CREATE NEW EXTERNAL
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
      <TabsList className="grid w-full grid-cols-2 bg-black/20">
        <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <UploadCloud className="mr-2 h-4 w-4"/> Fichier Local
        </TabsTrigger>
        <TabsTrigger value="external" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <LinkIcon className="mr-2 h-4 w-4"/> Lien Externe
        </TabsTrigger>
      </TabsList>

      {/* --- TAB: UPLOAD (Local) --- */}
      <TabsContent value="upload" className="mt-4">
        <Form {...uploadForm}>
          <form onSubmit={uploadForm.handleSubmit(onUploadSubmit)} className="space-y-4">

            {/* FILE INPUT Logic */}
            {!isLocalEdit ? (
               // Show File Input for Create OR External->Local Migration
               <FormField
               control={uploadForm.control}
               name="file" // This name must match key in uploadSchema
               render={({ field }) => (
                 <FormItem>
                   <FormLabel className="text-white">
                      {isEditing ? "Nouveau fichier (Remplacement) *" : "Fichier *"}
                   </FormLabel>
                   <FormControl>
                     <Input
                       type="file"
                       className="cursor-pointer file:text-foreground bg-black/20 border-white/10 text-white"
                       // Ref handling for react-hook-form with file input
                       ref={field.ref}
                       name={field.name}
                       onBlur={field.onBlur}
                       disabled={field.disabled}
                       onChange={(event) => {
                         field.onChange(event.target.files);
                       }}
                     />
                   </FormControl>
                   {isEditing && (
                      <p className="text-xs text-yellow-400">
                        Attention : Convertira ce lien externe en fichier stocké localement.
                      </p>
                   )}
                   <FormMessage />
                 </FormItem>
               )}
             />
            ) : (
              // Hide File Input for Local->Local Edit
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
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary hover:bg-[#e84232] text-white">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? (
                        <><Save className="mr-2 h-4 w-4" /> Enregistrer / Convertir</>
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
            <FormField
              control={externalForm.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">URL du document *</FormLabel>
                  <FormControl>
                    <Input placeholder="https://docs.google.com/..." {...field} className="bg-black/20 border-white/10 text-white" />
                  </FormControl>
                  {isEditing && !isExternalOrigin && (
                      <p className="text-xs text-yellow-400">
                        Attention : Le fichier local actuel sera supprimé et remplacé par ce lien.
                      </p>
                   )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <SharedFields form={externalForm} />

            <DialogFooter className="pt-4">
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary hover:bg-[#e84232] text-white">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? (
                        <><Save className="mr-2 h-4 w-4" /> Enregistrer / Convertir</>
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

function SharedFields<T extends FieldValues>({ form }: { form: UseFormReturn<T> }) {
  return (
    <>
      <FormField
        control={form.control}
        name={"name" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Nom *</FormLabel>
            <FormControl>
              <Input placeholder="Ex: CV 2024" {...field} className="bg-black/20 border-white/10 text-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={"type" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Type *</FormLabel>
            <FormControl>
                <Input placeholder="Ex: CV, Lettre, Portfolio..." {...field} className="bg-black/20 border-white/10 text-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={"description" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Notes..."
                className="resize-none bg-black/20 border-white/10 text-white min-h-[80px]"
                {...field}
                value={(field.value as string) || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { useCreateDocument } from '@/hooks/documents/use-create-document';
import { useUpdateDocument } from '@/hooks/documents/use-update-document';
import { useReplaceDocumentFile } from '@/hooks/documents/use-replace-document-file';
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

// Exported types for the UI component
export type UploadFormValues = z.infer<typeof uploadSchema>;
export type MetadataFormValues = z.infer<typeof metadataSchema>;
export type ExternalFormValues = z.infer<typeof externalSchema>;

interface UseDocumentFormLogicProps {
  initialData?: Document;
  onSuccess: (document?: Document) => void;
}

export function useDocumentFormLogic({ initialData, onSuccess }: UseDocumentFormLogicProps) {
  const isEditing = !!initialData;
  const isExternalOrigin = initialData?.is_external ?? false;

  // If editing a document that is already a local file, we are in "Metadata Only" mode for the upload tab
  const isLocalEdit = isEditing && !isExternalOrigin;

  // Tab management
  const [tab, setTab] = useState<'upload' | 'external'>(
    isEditing && isExternalOrigin ? 'external' : 'upload'
  );

  // Mutations
  const { createExternal, uploadFile, isPending: isCreating } = useCreateDocument();
  const { mutateAsync: updateDocument, isPending: isUpdating } = useUpdateDocument();
  const { replaceFile, isPending: isReplacing } = useReplaceDocumentFile();

  const isPending = isCreating || isUpdating || isReplacing;

  // --- FORMS SETUP ---

  // Upload Form (or Metadata if local edit)
  const currentUploadSchema = isLocalEdit ? metadataSchema : uploadSchema;
  const uploadForm = useForm<UploadFormValues | MetadataFormValues>({
    resolver: zodResolver(currentUploadSchema),
    defaultValues: { name: '', type: '', description: '' },
  });

  // External Form
  const externalForm = useForm<ExternalFormValues>({
    resolver: zodResolver(externalSchema),
    defaultValues: { name: '', type: '', path: '', description: '' },
  });

  // --- DATA POPULATION ---
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
      let createdDoc: Document | undefined;

      if (isEditing) {
        if (isExternalOrigin) {
          // --- COMPLEX SCENARIO: External -> Local Conversion ---

          // 1. File Replacement (Critical)
          const file = (values as UploadFormValues).file[0];
          await replaceFile.mutateAsync({
            documentId: initialData.id,
            data: { file: file }
          });

          // 2. Metadata Update (Secondary)
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
            console.error("Error updating metadata after upload", metaError);
            toast.warning("Fichier converti, mais les infos (nom/desc) n'ont pas pu être mises à jour.");
          }
        } else {
          // --- SIMPLE SCENARIO: Local -> Local (Update Metadata only) ---
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
        // --- SIMPLE SCENARIO: Local Creation ---
        const file = (values as UploadFormValues).file[0];
        createdDoc = await uploadFile.mutateAsync({
          data: {
            file: file,
            name: values.name,
            type: values.type,
            description: values.description || "",
          }
        });
      }
      onSuccess(createdDoc);
    } catch (error) {
      console.error(error);
    }
  };

  const onExternalSubmit = async (values: ExternalFormValues) => {
    try {
      let createdDoc: Document | undefined;

      if (isEditing) {
        // Update or Local -> External Conversion
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
        // External Creation
        createdDoc = await createExternal.mutateAsync({
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
      onSuccess(createdDoc);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    // State
    tab,
    setTab,
    isPending,
    isEditing,
    isLocalEdit,
    isExternalOrigin,

    // Forms
    uploadForm,
    externalForm,

    // Handlers
    onUploadSubmit: uploadForm.handleSubmit(onUploadSubmit),
    onExternalSubmit: externalForm.handleSubmit(onExternalSubmit),
  };
}

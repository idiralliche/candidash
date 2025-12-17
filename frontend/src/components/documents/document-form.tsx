import { useState, useEffect } from 'react';
import { useForm, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UploadCloud, Link as LinkIcon, Save } from 'lucide-react';

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
import { useCreateDocument } from '@/hooks/use-create-document';
import { useUpdateDocument } from '@/hooks/use-update-document';
import { Document } from '@/api/model';

// --- Zod Schemas ---

const baseSchema = {
  name: z.string().min(1, 'Le nom est requis').max(255),
  type: z.string().min(1, 'Le type est requis'),
  description: z.string().max(5000).optional(),
};

const uploadSchema = z.object({
  ...baseSchema,
  file: z.instanceof(FileList).refine((files) => files.length > 0, 'Un fichier est requis'),
});

const externalSchema = z.object({
  ...baseSchema,
  path: z.string().url('URL invalide (doit commencer par http/https)'),
});

const updateSchema = z.object({
  ...baseSchema,
});

type UploadFormValues = z.infer<typeof uploadSchema>;
type ExternalFormValues = z.infer<typeof externalSchema>;
type UpdateFormValues = z.infer<typeof updateSchema>;

interface DocumentFormProps {
  onSuccess: () => void;
  initialData?: Document;
}

export function DocumentForm({ onSuccess, initialData }: DocumentFormProps) {
  const [tab, setTab] = useState<'upload' | 'external'>('upload');

  const { createExternal, uploadFile, isPending: isCreating } = useCreateDocument();
  const { mutateAsync: updateDocument, isPending: isUpdating } = useUpdateDocument();

  const isPending = isCreating || isUpdating;
  const isEditing = !!initialData;

  // Forms Hooks
  const updateForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: { name: '', type: '', description: '' },
  });

  const uploadForm = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { name: '', type: '', description: '' },
  });

  const externalForm = useForm<ExternalFormValues>({
    resolver: zodResolver(externalSchema),
    defaultValues: { name: '', type: '', path: '', description: '' },
  });

  // Populate on edit
  useEffect(() => {
    if (initialData) {
      updateForm.reset({
        name: initialData.name,
        type: initialData.type,
        description: initialData.description || '',
      });
    }
  }, [initialData, updateForm]);

  // Handlers
  const onUploadSubmit = async (values: UploadFormValues) => {
    try {
      const file = values.file[0];
      await uploadFile.mutateAsync({
        data: {
            file: file,
            name: values.name,
            type: values.type,
            description: values.description || "",
        }
      });
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  const onExternalSubmit = async (values: ExternalFormValues) => {
    try {
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
      onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  const onUpdateSubmit = async (values: UpdateFormValues) => {
    if (!initialData) return;
    try {
        await updateDocument({
            documentId: initialData.id,
            data: {
                name: values.name,
                type: values.type,
                description: values.description || null,
            }
        });
        onSuccess();
    } catch (error) {
        console.error(error);
    }
  };

  // --- RENDER : EDIT MODE ---
  if (isEditing) {
    return (
        <Form {...updateForm}>
          <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
             <SharedFields form={updateForm} />
             <DialogFooter className="pt-4">
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary hover:bg-[#e84232] text-white">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Enregistrer les modifications
                </Button>
             </DialogFooter>
          </form>
        </Form>
    );
  }

  // --- RENDER : CREATE MODE ---
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

      <TabsContent value="upload" className="mt-4">
        <Form {...uploadForm}>
          <form onSubmit={uploadForm.handleSubmit(onUploadSubmit)} className="space-y-4">
            <FormField
              control={uploadForm.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Fichier *</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      className="cursor-pointer file:text-foreground bg-black/20 border-white/10 text-white"
                      ref={field.ref}
                      name={field.name}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                      onChange={(event) => {
                        field.onChange(event.target.files);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SharedFields form={uploadForm} />
            <DialogFooter className="pt-4">
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary hover:bg-[#e84232] text-white">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Uploader
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </TabsContent>

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
                  <FormMessage />
                </FormItem>
              )}
            />
            <SharedFields form={externalForm} />
            <DialogFooter className="pt-4">
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary hover:bg-[#e84232] text-white">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Ajouter le lien
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

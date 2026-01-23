import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Control, FieldValues, Path } from 'react-hook-form';
import { File, UploadCloud, Trash2, FileText, Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import { formatBytes } from '@/lib/utils';

// --- SHARED FIELDS ---
interface SharedDocumentFieldsProps<T extends FieldValues> {
  control: Control<T>;
}

export function SharedDocumentFields<T extends FieldValues>({ control }: SharedDocumentFieldsProps<T>) {
  return (
    <>
      <SmartFormField
        control={control}
        name={"name" as Path<T>}
        label="Nom *"
        component={Input}
        placeholder="Ex: CV 2024"
        leadingIcon={FileText}
      />
      <SmartFormField
        control={control}
        name={"type" as Path<T>}
        label="Type *"
        component={Input}
        placeholder="Ex: CV, Lettre, Portfolio..."
        leadingIcon={Tag}
      />
      <SmartFormField
        control={control}
        name={"description" as Path<T>}
        label="Description"
        component={Textarea}
        placeholder="Notes..."
        maxLength={5000}
        showCharCount
      />
    </>
  );
}

// --- FILE UPLOADER ---
interface FileUploaderProps {
  value: FileList | null;
  onChange: (files: FileList | null) => void;
  isEditing: boolean;
}

export function FileUploader({ value, onChange, isEditing }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
       const dataTransfer = new DataTransfer();
       dataTransfer.items.add(acceptedFiles[0]);
       onChange(dataTransfer.files);
    }
  }, [onChange]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
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

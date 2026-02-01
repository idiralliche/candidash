import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FieldValues, Path, ControllerRenderProps } from 'react-hook-form';
import { File, UploadCloud, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/utils';
import { useSmartField } from '@/hooks/shared/use-smart-field';

interface FileUploaderProps<T extends FieldValues, TName extends Path<T>> {
  // Ajout de la prop field optionnelle pour compatibilité directe
  field?: ControllerRenderProps<T, TName>;
  value?: FileList | null;
  onChange?: (files: FileList | null) => void;
  isEditing: boolean;
}

export function FileUploader<T extends FieldValues = FieldValues, TName extends Path<T> = Path<T>>({
  field: propField,
  value,
  onChange,
  isEditing
}: FileUploaderProps<T, TName>) {
  // 1. Récupération du contexte
  const contextField = useSmartField<T, TName>();
  const field = propField || contextField;

  // 2. Résolution de la valeur (RHF > Props)
  const resolvedValue = field?.value ?? value;
  const selectedFile = resolvedValue && resolvedValue.length > 0 ? resolvedValue[0] : null;

  // 3. Wrapper pour le changement
  const handleValueChange = useCallback((files: FileList | null) => {
    if (field) {
      field.onChange(files);
      field.onBlur(); // Marque le champ comme "touched" pour la validation
    }
    if (onChange) {
      onChange(files);
    }
  }, [field, onChange]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
       const dataTransfer = new DataTransfer();
       dataTransfer.items.add(acceptedFiles[0]);
       handleValueChange(dataTransfer.files);
    }
  }, [handleValueChange]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false
  });

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
          onClick={() => handleValueChange(null)}
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

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import {
  useCreateDocumentApiV1DocumentsPost,
  useUploadDocumentApiV1DocumentsUploadPost
} from '@/api/documents/documents';
import { getGetDocumentsApiV1DocumentsGetQueryKey } from '@/api/documents/documents';
import { HTTPValidationError } from '@/api/model';

export function useCreateDocument() {
  const queryClient = useQueryClient();

  const onSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: getGetDocumentsApiV1DocumentsGetQueryKey(),
    });
    toast.success("Document ajouté avec succès");
  };

  // Helper to extract error message safely
  const onError = (err: AxiosError<HTTPValidationError>) => {
    const detail = err.response?.data?.detail;

    // FastAPI sends an array for validation errors (422), or a string for logical errors (400)
    let message = "Une erreur est survenue lors de la création.";

    if (typeof detail === 'string') {
      message = detail;
    } else if (Array.isArray(detail)) {
      message = "Erreur de validation : Vérifiez les champs du formulaire.";
    }

    toast.error(message);
  };

  // Mutation for External Links (JSON Body)
  const createExternal = useCreateDocumentApiV1DocumentsPost({
    mutation: {
      onSuccess,
      onError: (e) => onError(e as AxiosError<HTTPValidationError>)
    },
  });

  // Mutation for File Upload (Multipart)
  const uploadFile = useUploadDocumentApiV1DocumentsUploadPost({
    mutation: {
      onSuccess,
      onError: (e) => onError(e as AxiosError<HTTPValidationError>)
    },
  });

  return {
    createExternal,
    uploadFile,
    isPending: createExternal.isPending || uploadFile.isPending,
  };
}

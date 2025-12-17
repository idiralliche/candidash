import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useUpdateDocumentApiV1DocumentsDocumentIdPut } from '@/api/documents/documents';
import { getGetDocumentsApiV1DocumentsGetQueryKey } from '@/api/documents/documents';
import { HTTPValidationError } from '@/api/model';

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useUpdateDocumentApiV1DocumentsDocumentIdPut({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetDocumentsApiV1DocumentsGetQueryKey(),
        });
        toast.success("Document mis à jour");
      },
      onError: (err) => {
        const error = err as AxiosError<HTTPValidationError>;
        const detail = error.response?.data?.detail;
        const message = typeof detail === 'string' ? detail : "Erreur lors de la mise à jour.";
        toast.error(message);
      },
    },
  });
}

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useDeleteDocumentApiV1DocumentsDocumentIdDelete } from '@/api/documents/documents';
import { getGetDocumentsApiV1DocumentsGetQueryKey } from '@/api/documents/documents';
import { HTTPValidationError } from '@/api/model';

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useDeleteDocumentApiV1DocumentsDocumentIdDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetDocumentsApiV1DocumentsGetQueryKey(),
        });
        toast.success("Document supprimé");
      },
      onError: (err) => {
        const error = err as AxiosError<HTTPValidationError>;
        const detail = error.response?.data?.detail;
        const message = typeof detail === 'string' ? detail : "Impossible de supprimer le document.";
        toast.error(message);
      },
    },
  });
}

import { useQueryClient } from '@tanstack/react-query';
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
      },
      onError: (err) => {
        const error = err as AxiosError<HTTPValidationError>;
        console.error('Delete document error:', error.response?.data);
      },
    },
  });
}

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import {
  useReplaceFileApiV1DocumentsDocumentIdReplaceFilePost
} from '@/api/documents/documents';
import { getGetDocumentsApiV1DocumentsGetQueryKey } from '@/api/documents/documents';
import { HTTPValidationError } from '@/api/model';

export function useReplaceDocumentFile() {
  const queryClient = useQueryClient();

  const mutation = useReplaceFileApiV1DocumentsDocumentIdReplaceFilePost({
    mutation: {
      onSuccess: () => {
        // Refresh the list to show the new status (local) and updated date
        queryClient.invalidateQueries({
          queryKey: getGetDocumentsApiV1DocumentsGetQueryKey(),
        });
        toast.success("Document converted to local file successfully");
      },
      onError: (err) => {
        const error = err as AxiosError<HTTPValidationError>;
        const detail = error.response?.data?.detail;

        let message = "Error while replacing the file.";

        // Handle specific errors (e.g., quota exceeded, file too large)
        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = "File validation error.";
        }

        toast.error(message);
      },
    },
  });

  return {
    replaceFile: mutation, // Expose the full mutation object (mutate, mutateAsync)
    isPending: mutation.isPending,
  };
}

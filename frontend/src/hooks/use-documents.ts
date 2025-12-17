import { useGetDocumentsApiV1DocumentsGet } from '@/api/documents/documents';
import { useAuth } from '@/hooks/use-auth';

export function useDocuments(skip = 0, limit = 100) {
  const { isAuthenticated } = useAuth();

  const query = useGetDocumentsApiV1DocumentsGet(
    { skip, limit },
    {
      query: {
        enabled: isAuthenticated,
        retry: false,
        refetchOnWindowFocus: false,
      },
    }
  );

  return {
    documents: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

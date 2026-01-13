import { useGetActionsApiV1ActionsGet } from '@/api/actions/actions';
import { useAuth } from '@/hooks/use-auth';
import { keepPreviousData } from '@tanstack/react-query';

interface UseActionsParams {
  skip?: number;
  limit?: number;
  applicationId?: number;
  completed?: boolean;
  enabled?: boolean;
}

export function useActions({
  skip = 0,
  limit = 100,
  applicationId,
  completed,
  enabled = true
}: UseActionsParams = {}) {
  const { isAuthenticated } = useAuth();

  const query = useGetActionsApiV1ActionsGet(
    {
      skip,
      limit,
      application_id: applicationId,
      completed,
    },
    {
      query: {
        enabled: isAuthenticated && enabled,
        retry: false,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
      },
    }
  );

  return {
    actions: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

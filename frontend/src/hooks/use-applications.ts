import { useGetApplicationsApiV1ApplicationsGet } from '@/api/applications/applications';
import { useAuth } from '@/hooks/use-auth';
import { ApplicationStatus } from '@/api/model';
import { keepPreviousData } from '@tanstack/react-query';

interface UseApplicationsParams {
  skip?: number;
  limit?: number;
  opportunityId?: number;
  status?: ApplicationStatus;
  isArchived?: boolean;
  enabled?: boolean;
}

export function useApplications({
  skip = 0,
  limit = 100,
  opportunityId,
  status,
  isArchived,
  enabled = true
}: UseApplicationsParams = {}) {
  const { isAuthenticated } = useAuth();

  const query = useGetApplicationsApiV1ApplicationsGet(
    {
      skip,
      limit,
      opportunity_id: opportunityId,
      status,
      is_archived: isArchived
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
    applications: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

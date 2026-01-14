import { useGetScheduledEventsApiV1ScheduledEventsGet } from '@/api/scheduled-events/scheduled-events';
import { EventStatus } from '@/api/model';
import { useAuth } from '@/hooks/shared/use-auth';

interface ScheduledEventsParams {
  skip?: number;
  limit?: number;
  status?: EventStatus | null;
}

export function useScheduledEvents(params: ScheduledEventsParams = {}) {
  const { isAuthenticated } = useAuth();

  const {
    skip = 0,
    limit = 100,
    status
  } = params

  const query = useGetScheduledEventsApiV1ScheduledEventsGet(
    {
      skip,
      limit,
      status
    },
    {
      query: {
        enabled: isAuthenticated,
        retry: false,
        refetchOnWindowFocus: false,
      },
    }
  );

  return {
    events: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
}

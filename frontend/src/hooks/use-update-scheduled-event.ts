import { useQueryClient } from '@tanstack/react-query';
import {
  useUpdateScheduledEventApiV1ScheduledEventsEventIdPut,
  getGetScheduledEventsApiV1ScheduledEventsGetQueryKey
} from '@/api/scheduled-events/scheduled-events';

export function useUpdateScheduledEvent() {
  const queryClient = useQueryClient();

  return useUpdateScheduledEventApiV1ScheduledEventsEventIdPut({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetScheduledEventsApiV1ScheduledEventsGetQueryKey(),
        });
      },
    },
  });
}

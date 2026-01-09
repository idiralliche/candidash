import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteScheduledEventApiV1ScheduledEventsEventIdDelete,
  getGetScheduledEventsApiV1ScheduledEventsGetQueryKey
} from '@/api/scheduled-events/scheduled-events';

export function useDeleteScheduledEvent() {
  const queryClient = useQueryClient();

  return useDeleteScheduledEventApiV1ScheduledEventsEventIdDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetScheduledEventsApiV1ScheduledEventsGetQueryKey(),
        });
      },
    },
  });
}

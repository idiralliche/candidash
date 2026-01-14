import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateScheduledEventApiV1ScheduledEventsPost,
  getGetScheduledEventsApiV1ScheduledEventsGetQueryKey
} from '@/api/scheduled-events/scheduled-events';

export function useCreateScheduledEvent() {
  const queryClient = useQueryClient();

  return useCreateScheduledEventApiV1ScheduledEventsPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetScheduledEventsApiV1ScheduledEventsGetQueryKey(),
        });
      },
    },
  });
}

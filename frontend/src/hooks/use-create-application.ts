import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateApplicationApiV1ApplicationsPost,
  getGetApplicationsApiV1ApplicationsGetQueryKey
} from '@/api/applications/applications';

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useCreateApplicationApiV1ApplicationsPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetApplicationsApiV1ApplicationsGetQueryKey(),
        });
      },
    },
  });
}

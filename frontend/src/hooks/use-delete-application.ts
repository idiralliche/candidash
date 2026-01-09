import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteApplicationApiV1ApplicationsApplicationIdDelete,
  getGetApplicationsApiV1ApplicationsGetQueryKey
} from '@/api/applications/applications';

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useDeleteApplicationApiV1ApplicationsApplicationIdDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetApplicationsApiV1ApplicationsGetQueryKey(),
        });
      },
    },
  });
}

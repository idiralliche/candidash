import { useQueryClient } from '@tanstack/react-query';
import {
  useUpdateApplicationApiV1ApplicationsApplicationIdPut,
  getGetApplicationsApiV1ApplicationsGetQueryKey
} from '@/api/applications/applications';

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useUpdateApplicationApiV1ApplicationsApplicationIdPut({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetApplicationsApiV1ApplicationsGetQueryKey(),
        });
      },
    },
  });
}

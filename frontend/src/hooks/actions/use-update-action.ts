import { useQueryClient } from '@tanstack/react-query';
import {
  useUpdateActionApiV1ActionsActionIdPut,
  getGetActionsApiV1ActionsGetQueryKey
} from '@/api/actions/actions';

export function useUpdateAction() {
  const queryClient = useQueryClient();

  return useUpdateActionApiV1ActionsActionIdPut({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetActionsApiV1ActionsGetQueryKey(),
        });
      }
    },
  });
}

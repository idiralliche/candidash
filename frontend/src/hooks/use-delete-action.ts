import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteActionApiV1ActionsActionIdDelete,
  getGetActionsApiV1ActionsGetQueryKey
} from '@/api/actions/actions';

export function useDeleteAction() {
  const queryClient = useQueryClient();

  return useDeleteActionApiV1ActionsActionIdDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetActionsApiV1ActionsGetQueryKey(),
        });
      },
    },
  });
}

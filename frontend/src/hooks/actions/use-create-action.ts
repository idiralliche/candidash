import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateActionApiV1ActionsPost,
  getGetActionsApiV1ActionsGetQueryKey
} from '@/api/actions/actions';

export function useCreateAction() {
  const queryClient = useQueryClient();

  return useCreateActionApiV1ActionsPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetActionsApiV1ActionsGetQueryKey(),
        });
      }
    },
  });
}

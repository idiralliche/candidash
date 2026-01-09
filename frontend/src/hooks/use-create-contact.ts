import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateContactApiV1ContactsPost,
  getGetContactsApiV1ContactsGetQueryKey
} from '@/api/contacts/contacts';

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useCreateContactApiV1ContactsPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetContactsApiV1ContactsGetQueryKey(),
        });
      },
    },
  });
}

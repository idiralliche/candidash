import { useQueryClient } from '@tanstack/react-query';
import { useDeleteContactApiV1ContactsContactIdDelete } from '@/api/contacts/contacts';
import { getGetContactsApiV1ContactsGetQueryKey } from '@/api/contacts/contacts';

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useDeleteContactApiV1ContactsContactIdDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetContactsApiV1ContactsGetQueryKey(),
        });
      },
    },
  });
}

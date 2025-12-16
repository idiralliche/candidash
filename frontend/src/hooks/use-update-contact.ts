import { useQueryClient } from '@tanstack/react-query';
import { useUpdateContactApiV1ContactsContactIdPut } from '@/api/contacts/contacts';
import { getGetContactsApiV1ContactsGetQueryKey } from '@/api/contacts/contacts';

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useUpdateContactApiV1ContactsContactIdPut({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetContactsApiV1ContactsGetQueryKey(),
        });
      },
    },
  });
}

import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateOpportunityContactApiV1OpportunityContactsPost,
  getGetOpportunityContactsApiV1OpportunityContactsGetQueryKey
} from '@/api/opportunity-contacts/opportunity-contacts';

export function useCreateOpportunityContact() {
  const queryClient = useQueryClient();

  return useCreateOpportunityContactApiV1OpportunityContactsPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetOpportunityContactsApiV1OpportunityContactsGetQueryKey(),
        });
      },
    },
  });
}

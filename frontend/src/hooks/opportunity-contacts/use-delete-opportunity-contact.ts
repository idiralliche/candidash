import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteOpportunityContactApiV1OpportunityContactsAssociationIdDelete,
  getGetOpportunityContactsApiV1OpportunityContactsGetQueryKey
} from '@/api/opportunity-contacts/opportunity-contacts';

export function useDeleteOpportunityContact() {
  const queryClient = useQueryClient();

  return useDeleteOpportunityContactApiV1OpportunityContactsAssociationIdDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetOpportunityContactsApiV1OpportunityContactsGetQueryKey(),
        });
      },
    },
  });
}

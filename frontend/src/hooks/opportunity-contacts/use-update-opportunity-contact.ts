import { useQueryClient } from '@tanstack/react-query';
import {
  useUpdateOpportunityContactApiV1OpportunityContactsAssociationIdPut,
  getGetOpportunityContactsApiV1OpportunityContactsGetQueryKey,
  getGetOpportunityContactApiV1OpportunityContactsAssociationIdGetQueryKey
} from '@/api/opportunity-contacts/opportunity-contacts';

export function useUpdateOpportunityContact() {
  const queryClient = useQueryClient();

  return useUpdateOpportunityContactApiV1OpportunityContactsAssociationIdPut({
    mutation: {
      onSuccess: (_data, variables) => {
        // 1. Invalidate the global associations list
        queryClient.invalidateQueries({
          queryKey: getGetOpportunityContactsApiV1OpportunityContactsGetQueryKey(),
        });

        // 2. Invalidate the specific details of this association (if displayed elsewhere)
        queryClient.invalidateQueries({
          queryKey: getGetOpportunityContactApiV1OpportunityContactsAssociationIdGetQueryKey(
            variables.associationId
          ),
        });
      },
    },
  });
}

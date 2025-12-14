import { useQueryClient } from '@tanstack/react-query';
import { useUpdateOpportunityApiV1OpportunitiesOpportunityIdPut } from '@/api/opportunities/opportunities';
import { getGetOpportunitiesApiV1OpportunitiesGetQueryKey } from '@/api/opportunities/opportunities';

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useUpdateOpportunityApiV1OpportunitiesOpportunityIdPut({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetOpportunitiesApiV1OpportunitiesGetQueryKey(),
        });
      },
    },
  });
}

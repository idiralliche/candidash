import { useQueryClient } from '@tanstack/react-query';
import { useDeleteOpportunityApiV1OpportunitiesOpportunityIdDelete } from '@/api/opportunities/opportunities';
import { getGetOpportunitiesApiV1OpportunitiesGetQueryKey } from '@/api/opportunities/opportunities';

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useDeleteOpportunityApiV1OpportunitiesOpportunityIdDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetOpportunitiesApiV1OpportunitiesGetQueryKey(),
        });
      },
    },
  });
}

import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteOpportunityApiV1OpportunitiesOpportunityIdDelete,
  getGetOpportunitiesApiV1OpportunitiesGetQueryKey
} from '@/api/opportunities/opportunities';

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

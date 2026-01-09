import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateOpportunityApiV1OpportunitiesPost,
  getGetOpportunitiesApiV1OpportunitiesGetQueryKey
} from '@/api/opportunities/opportunities';

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useCreateOpportunityApiV1OpportunitiesPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetOpportunitiesApiV1OpportunitiesGetQueryKey(),
        });
      },
    },
  });
}

import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateOpportunityProductApiV1OpportunityProductsPost,
  getGetOpportunityProductsApiV1OpportunityProductsGetQueryKey
} from '@/api/opportunity-products/opportunity-products';

export function useCreateOpportunityProduct() {
  const queryClient = useQueryClient();

  return useCreateOpportunityProductApiV1OpportunityProductsPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetOpportunityProductsApiV1OpportunityProductsGetQueryKey(),
        });
      },
    },
  });
}

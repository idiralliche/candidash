import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteOpportunityProductApiV1OpportunityProductsAssociationIdDelete,
  getGetOpportunityProductsApiV1OpportunityProductsGetQueryKey
} from '@/api/opportunity-products/opportunity-products';

export function useDeleteOpportunityProduct() {
  const queryClient = useQueryClient();

  return useDeleteOpportunityProductApiV1OpportunityProductsAssociationIdDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetOpportunityProductsApiV1OpportunityProductsGetQueryKey(),
        });
      },
    },
  });
}

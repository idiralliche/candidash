import { useGetOpportunityProductsApiV1OpportunityProductsGet } from '@/api/opportunity-products/opportunity-products';
import { useAuth } from '@/hooks/shared/use-auth';

interface UseOpportunityProductsParams {
  skip?: number;
  limit?: number;
  opportunity_id?: number | null;
  product_id?: number | null;
}

export function useOpportunityProducts(params: UseOpportunityProductsParams = {}) {
  const { isAuthenticated } = useAuth();

  const {
    skip = 0,
    limit = 100,
    opportunity_id,
    product_id
  } = params;

  const query = useGetOpportunityProductsApiV1OpportunityProductsGet(
    {
      skip,
      limit,
      opportunity_id,
      product_id
    },
    {
      query: {
        enabled: isAuthenticated,
        retry: false,
        refetchOnWindowFocus: false,
      },
    }
  );

  return {
    opportunityProducts: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
}

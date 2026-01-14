import { useGetProductsApiV1ProductsGet } from '@/api/products/products';
import { useAuth } from '@/hooks/shared/use-auth';

interface UseProductsParams {
  skip?: number;
  limit?: number;
  companyId?: number;
  enabled?: boolean;
}

export function useProducts({ skip = 0, limit = 100, companyId, enabled = true }: UseProductsParams = {}) {
  const { isAuthenticated } = useAuth();

  const query = useGetProductsApiV1ProductsGet(
    { skip, limit, company_id: companyId },
    {
      query: {
        enabled: isAuthenticated && enabled,
        retry: false,
        refetchOnWindowFocus: false,
      },
    }
  );

  return {
    products: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

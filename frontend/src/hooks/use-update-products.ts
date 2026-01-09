import { useQueryClient } from '@tanstack/react-query';
import { useUpdateProductApiV1ProductsProductIdPut, getGetProductsApiV1ProductsGetQueryKey } from '@/api/products/products';

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useUpdateProductApiV1ProductsProductIdPut({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetProductsApiV1ProductsGetQueryKey({ skip: 0, limit: 100 }).slice(0, 1),
        });
      },
    },
  });
}

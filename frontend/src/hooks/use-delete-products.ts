import { useQueryClient } from '@tanstack/react-query';
import { useDeleteProductApiV1ProductsProductIdDelete, getGetProductsApiV1ProductsGetQueryKey } from '@/api/products/products';

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useDeleteProductApiV1ProductsProductIdDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetProductsApiV1ProductsGetQueryKey({ skip: 0, limit: 100 }).slice(0, 1),
        });
      },
    },
  });
}

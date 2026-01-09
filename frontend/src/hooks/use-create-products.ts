import { useQueryClient } from '@tanstack/react-query';
import { useCreateProductApiV1ProductsPost, getGetProductsApiV1ProductsGetQueryKey } from '@/api/products/products';

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useCreateProductApiV1ProductsPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetProductsApiV1ProductsGetQueryKey({ skip: 0, limit: 100 }).slice(0, 1),
        });
      },
    },
  });
}

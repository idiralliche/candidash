import { useQueryClient } from '@tanstack/react-query';
import { useCreateCompanyApiV1CompaniesPost } from '@/api/companies/companies';
import { getGetCompaniesApiV1CompaniesGetQueryKey } from '@/api/companies/companies';

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useCreateCompanyApiV1CompaniesPost({
    mutation: {
      onSuccess: () => {
        // Invalidate the cache for the companies list to refetch updated data
        queryClient.invalidateQueries({
          queryKey: getGetCompaniesApiV1CompaniesGetQueryKey(),
        });
      },
    },
  });
}

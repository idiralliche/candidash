import { useQueryClient } from '@tanstack/react-query';
import { useUpdateCompanyApiV1CompaniesCompanyIdPut } from '@/api/companies/companies';
import { getGetCompaniesApiV1CompaniesGetQueryKey } from '@/api/companies/companies';

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useUpdateCompanyApiV1CompaniesCompanyIdPut({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetCompaniesApiV1CompaniesGetQueryKey(),
        });
      },
    },
  });
}

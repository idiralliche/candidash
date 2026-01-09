import { useQueryClient } from '@tanstack/react-query';
import {
  useUpdateCompanyApiV1CompaniesCompanyIdPut,
  getGetCompaniesApiV1CompaniesGetQueryKey
} from '@/api/companies/companies';

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

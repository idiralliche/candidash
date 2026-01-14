import { useQueryClient } from '@tanstack/react-query';
import {
  useDeleteCompanyApiV1CompaniesCompanyIdDelete,
  getGetCompaniesApiV1CompaniesGetQueryKey
} from '@/api/companies/companies';

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useDeleteCompanyApiV1CompaniesCompanyIdDelete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetCompaniesApiV1CompaniesGetQueryKey(),
        });
      },
    },
  });
}

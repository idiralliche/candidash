import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateCompanyApiV1CompaniesPost,
  getGetCompaniesApiV1CompaniesGetQueryKey
} from '@/api/companies/companies';

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useCreateCompanyApiV1CompaniesPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetCompaniesApiV1CompaniesGetQueryKey(),
        });
      },
    },
  });
}

import { useGetCompaniesApiV1CompaniesGet } from '@/api/companies/companies';
import { useAuth } from '@/hooks/use-auth';

export function useCompanies(skip = 0, limit = 100) {
  const { isAuthenticated } = useAuth();

  const query = useGetCompaniesApiV1CompaniesGet(
    { skip, limit },
    {
      query: {
        enabled: isAuthenticated,
        retry: false,
        refetchOnWindowFocus: false,
      },
    }
  );

  return {
    companies: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

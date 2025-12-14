import { useGetOpportunitiesApiV1OpportunitiesGet } from '@/api/opportunities/opportunities';
import { ApplicationType, ContractType } from '@/api/model';
import { useAuth } from '@/hooks/use-auth';

interface UseOpportunitiesParams {
  skip?: number;
  limit?: number;
  company_id?: number | null;
  application_type?: ApplicationType | null;
  contract_type?: ContractType | null;
}

export function useOpportunities(params: UseOpportunitiesParams = {}) {
  const { isAuthenticated } = useAuth();

  const {
    skip = 0,
    limit = 100,
    company_id,
    application_type,
    contract_type
  } = params;

  const query = useGetOpportunitiesApiV1OpportunitiesGet(
    {
      skip,
      limit,
      company_id,
      application_type,
      contract_type
    },
    {
      query: {
        enabled: isAuthenticated,
        retry: false,
        refetchOnWindowFocus: false,
      },
    }
  );

  return {
    opportunities: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
}

import { useGetOpportunityContactsApiV1OpportunityContactsGet } from '@/api/opportunity-contacts/opportunity-contacts';
import { useAuth } from '@/hooks/shared/use-auth';

interface UseOpportunityContactsParams {
  skip?: number;
  limit?: number;
  opportunity_id?: number | null;
  contact_id?: number | null;
  is_primary_contact?: boolean | null;
}

export function useOpportunityContacts(params: UseOpportunityContactsParams = {}) {
  const { isAuthenticated } = useAuth();

  const {
    skip = 0,
    limit = 100,
    opportunity_id,
    contact_id,
    is_primary_contact
  } = params;

  const query = useGetOpportunityContactsApiV1OpportunityContactsGet(
    {
      skip,
      limit,
      opportunity_id,
      contact_id,
      is_primary_contact,
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
    opportunityContacts: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
}

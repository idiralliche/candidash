import { useGetContactsApiV1ContactsGet } from '@/api/contacts/contacts';
import { useAuth } from '@/hooks/shared/use-auth';

interface UseContactsParams {
  skip?: number;
  limit?: number;
  company_id?: number | null;
  is_independent_recruiter?: boolean | null;
}

export function useContacts(params: UseContactsParams = {}) {
  const { isAuthenticated } = useAuth();

  const {
    skip = 0,
    limit = 100,
    company_id,
    is_independent_recruiter
  } = params;

  const query = useGetContactsApiV1ContactsGet(
    {
      skip,
      limit,
      company_id,
      is_independent_recruiter
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
    contacts: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
}

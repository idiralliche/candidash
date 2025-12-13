import { useGetUserApiV1UsersMeGet } from '@/api/users/users';
import { useAuth } from '@/hooks/use-auth';

export function useUserProfile() {
  const { isAuthenticated } = useAuth();

  const query = useGetUserApiV1UsersMeGet({
    query: {
      enabled: isAuthenticated,

      retry: false,
      refetchOnWindowFocus: false,
    }
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  };
}

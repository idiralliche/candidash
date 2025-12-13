import { useGetUserApiV1UsersMeGet } from '@/api/users/users';
import { useAuth } from '@/hooks/use-auth';

export function useUserProfile() {
  const { isAuthenticated } = useAuth();

  const query = useGetUserApiV1UsersMeGet({
    query: {
      // La requête ne part que si on est authentifié localement
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

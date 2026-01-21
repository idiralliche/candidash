import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateApplicationWithOpportunityApiV1ApplicationsWithOpportunityPost,
  getGetApplicationsApiV1ApplicationsGetQueryKey,
} from "@/api/applications/applications";
import { getGetOpportunitiesApiV1OpportunitiesGetQueryKey } from "@/api/opportunities/opportunities";

/**
 * Hook to handle the initialization step of the wizard.
 * Creates both an Application and an Opportunity in a single transaction.
 * Invalidates related queries on success to refresh lists.
 */
export function useWizardInitMutation() {
  const queryClient = useQueryClient();

  return useCreateApplicationWithOpportunityApiV1ApplicationsWithOpportunityPost({
    mutation: {
      onSuccess: () => {
        // Invalidate applications list to show the new entry
        queryClient.invalidateQueries({
          queryKey: getGetApplicationsApiV1ApplicationsGetQueryKey(),
        });

        // Invalidate opportunities list as a new one is created implicitly
        queryClient.invalidateQueries({
          queryKey: getGetOpportunitiesApiV1OpportunitiesGetQueryKey(),
        });
      },
    },
  });
}

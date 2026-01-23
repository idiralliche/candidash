import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { useApplications } from '@/hooks/applications/use-applications';
import { useDeleteApplication } from '@/hooks/applications/use-delete-application';
import { useFilteredEntities } from '@/hooks/shared/use-filtered-entities';
import { Application } from '@/api/model';
import { getLabel, LABELS_APPLICATION_STATUS } from '@/lib/dictionaries';

export function useApplicationsPage() {
  const navigate = useNavigate();

  // 1. Data Fetching
  const { applications, isLoading } = useApplications();
  const { mutate: deleteApplication, isPending: isDeleting } = useDeleteApplication();

  // 2. Local State
  const [search, setSearch] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  // 3. Filtering Logic
  const filteredApplications = useFilteredEntities({
    entities: applications,
    searchTerm: search,
    searchFields: (app) => {
      const opportunityTitle = app.opportunity?.job_title;
      const statusLabel = getLabel(LABELS_APPLICATION_STATUS, app.status);
      return [
        opportunityTitle || '',
        statusLabel || '',
        app.status || '',
      ];
    },
    // Sort by Date (Newest first)
    sortFn: (a, b) => {
      return new Date(b.application_date).getTime() - new Date(a.application_date).getTime();
    },
  });

  // 4. Handlers
  const handleDelete = async () => {
    if (!applicationToDelete) return;
    setDeleteError('');
    try {
      await deleteApplication({ applicationId: applicationToDelete.id });
      toast.success('Candidature supprimée avec succès');
      setApplicationToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      setDeleteError('Impossible de supprimer cette candidature.');
    }
  };

  const handleEditFromDetails = (app: Application) => {
    setSelectedApplication(null);
    setEditingApplication(app);
  };

  const handleDeleteFromDetails = (app: Application) => {
    setSelectedApplication(null);
    setApplicationToDelete(app);
  };

  const handleCloseDeleteDialog = (open: boolean) => {
    if (!open) {
      setApplicationToDelete(null);
      setDeleteError('');
    }
  };

  // 5. Helpers
  const deleteLabel = applicationToDelete?.opportunity?.job_title || "cette candidature";

  return {
    // State
    search,
    isLoading,
    isDeleting,
    filteredApplications,
    selectedApplication,
    editingApplication,
    applicationToDelete,
    deleteError,
    deleteLabel,

    // Actions
    setSearch,
    setSelectedApplication,
    setEditingApplication,
    setApplicationToDelete,
    handleDelete,
    handleEditFromDetails,
    handleDeleteFromDetails,
    handleCloseDeleteDialog,
    navigateToWizard: () => navigate({ to: '/application-wizard' }),
  };
}

import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { useOpportunities } from '@/hooks/opportunities/use-opportunities';
import { useDeleteOpportunity } from '@/hooks/opportunities/use-delete-opportunity';
import { Opportunity } from '@/api/model';

export function useOpportunitiesPage() {
  const navigate = useNavigate();

  // 1. Data Fetching
  const { opportunities, isLoading } = useOpportunities();
  const { mutate: deleteOpportunity, isPending: isDeleting } = useDeleteOpportunity();

  // 2. Local State
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  // 3. Sorting Logic (Alphabetical)
  const sortedOpportunities = useMemo(() => {
    if (!opportunities) return [];
    return [...opportunities].sort((a, b) =>
      a.job_title.localeCompare(b.job_title)
    );
  }, [opportunities]);

  // 4. Handlers
  const handleDelete = async () => {
    if (!opportunityToDelete) return;
    setDeleteError('');
    try {
      await deleteOpportunity({ opportunityId: opportunityToDelete.id });
      toast.success('Opportunité supprimée avec succès');
      setOpportunityToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setDeleteError('Une erreur est survenue lors de la suppression.');
    }
  };

  const handleEditFromDetails = (op: Opportunity) => {
    setSelectedOpportunity(null);
    setEditingOpportunity(op);
  };

  const handleDeleteFromDetails = (op: Opportunity) => {
    setSelectedOpportunity(null);
    setOpportunityToDelete(op);
  };

  const handleCloseDeleteDialog = (open: boolean) => {
    if (!open) {
      setOpportunityToDelete(null);
      setDeleteError('');
    }
  };

  return {
    // State
    isLoading,
    isDeleting,
    sortedOpportunities,
    selectedOpportunity,
    editingOpportunity,
    opportunityToDelete,
    deleteError,

    // Actions
    setSelectedOpportunity,
    setEditingOpportunity,
    setOpportunityToDelete,
    handleDelete,
    handleEditFromDetails,
    handleDeleteFromDetails,
    handleCloseDeleteDialog,
    navigateToWizard: () => navigate({ to: '/application-wizard' }),
  };
}

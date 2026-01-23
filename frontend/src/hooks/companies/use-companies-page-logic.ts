import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { useCompanies } from '@/hooks/companies/use-companies';
import { useDeleteCompany } from '@/hooks/companies/use-delete-company';
import { useProducts } from '@/hooks/products/use-products';
import { Company } from '@/api/model';

export function useCompaniesPageLogic() {
  const { companies, isLoading } = useCompanies();
  const { mutateAsync: deleteCompany, isPending: isDeleting } = useDeleteCompany();
  const { products: allProducts } = useProducts();

  // --- STATE ---
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // --- DERIVED DATA ---

  // Sort companies alphabetically
  const sortedCompanies = useMemo(() => {
    if (!companies) return [];
    return [...companies].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [companies]);

  // Filter products for the selected company (for the details sheet)
  const selectedCompanyProducts = useMemo(() => {
    if (!selectedCompany || !allProducts) return [];
    return allProducts.filter(p => p.company_id === selectedCompany.id);
  }, [selectedCompany, allProducts]);

  // --- HANDLERS ---
  const handleDelete = async () => {
    if (!companyToDelete) return;
    setDeleteError('');
    try {
      await deleteCompany({ companyId: companyToDelete.id });
      toast.success('Entreprise supprimée avec succès');
      setCompanyToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setDeleteError('Une erreur est survenue lors de la suppression.');
    }
  };

  const closeDeleteDialog = (open: boolean) => {
    if (!open) {
      setCompanyToDelete(null);
      setDeleteError('');
    }
  };

  const openEditFromDetails = (company: Company) => {
    setSelectedCompany(null);
    setEditingCompany(company);
  };

  const openDeleteFromDetails = (company: Company) => {
    setSelectedCompany(null);
    setCompanyToDelete(company);
  };

  return {
    // Data
    sortedCompanies,
    selectedCompanyProducts,
    isLoading,

    // State
    selectedCompany,
    setSelectedCompany,
    companyToDelete,
    setCompanyToDelete,
    editingCompany,
    setEditingCompany,
    deleteError,
    isDeleting,

    // Handlers
    handleDelete,
    closeDeleteDialog,
    openEditFromDetails,
    openDeleteFromDetails,
  };
}

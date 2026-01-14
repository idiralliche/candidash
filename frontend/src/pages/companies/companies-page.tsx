import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, Building2 } from 'lucide-react';

import { useCompanies } from '@/hooks/companies/use-companies';
import { useDeleteCompany } from '@/hooks/companies/use-delete-company';
import { Company } from '@/api/model';
import { useProducts } from '@/hooks/products/use-products';

import { Fab } from '@/components/ui/fab';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { EmptyState } from '@/components/shared/empty-state';

// Layout Components
import { PageLayout } from '@/components/layouts/page-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { PageContent } from '@/components/layouts/page-content';

// Shared Components
import { EntitySheet } from '@/components/shared/entity-sheet';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';
import { FormDialog } from '@/components/shared/form-dialog';

// Feature Components
import { CompanyForm } from '@/components/companies/company-form';
import { CompanyDetails } from '@/components/companies/company-details';
import { CompanyCard } from '@/components/companies/company-card';

export function CompaniesPage() {
  const { companies, isLoading } = useCompanies();
  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();

  // State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const { products: allProducts } = useProducts();
  const selectedCompanyProducts = useMemo(() => {
    if (!selectedCompany || !allProducts) return [];
    return allProducts.filter(p => p.company_id === selectedCompany.id);
  }, [selectedCompany, allProducts]);

  // Sorting Logic
  const sortedCompanies = useMemo(() => {
    if (!companies) return [];
    return [...companies].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [companies]);

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

  return (
    <PageLayout>
      <PageHeader
        title="Entreprises"
        action={
          <FormDialog
            title="Nouvelle Entreprise"
            description="Ajoutez une entreprise pour y associer des contacts et des opportunités."
            trigger={
              <Fab>
                <Plus className="h-5 w-5" />
              </Fab>
            }
          >
            {(close) => <CompanyForm onSuccess={close} />}
          </FormDialog>
        }
      />

      <PageContent>
        {isLoading ? (
          <CardListSkeleton />
        ) : sortedCompanies.length === 0 ? (
          <EmptyState
            icon={Building2}
            message="Aucune entreprise trouvée. Commencez par en ajouter une !"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {sortedCompanies.map(company => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={setSelectedCompany}
                onEdit={setEditingCompany}
                onDelete={setCompanyToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!selectedCompany}
        onOpenChange={(open) => !open && setSelectedCompany(null)}
        title="Fiche Entreprise"
      >
        {selectedCompany && (
          <CompanyDetails
            company={selectedCompany}
            products={selectedCompanyProducts}
            onEdit={(c) => {
              setSelectedCompany(null);
              setEditingCompany(c);
            }}
            onDelete={(c) => {
              setSelectedCompany(null);
              setCompanyToDelete(c);
            }}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!editingCompany}
        onOpenChange={(open) => !open && setEditingCompany(null)}
        title="Modifier l'entreprise"
        description="Modifiez les informations de l'entreprise."
      >
        {(close) => editingCompany && (
          <CompanyForm
            initialData={editingCompany}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!companyToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCompanyToDelete(null);
            setDeleteError('');
          }
        }}
        entityType="entreprise"
        entityLabel={companyToDelete?.name || ''}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </PageLayout>
  );
}

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, Building2 } from 'lucide-react';

import { useCompanies } from '@/hooks/use-companies';
import { useDeleteCompany } from '@/hooks/use-delete-company';
import { Company } from '@/api/model';

import { Button } from '@/components/ui/button';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";

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
    <div className="space-y-6 pt-20 h-[calc(100vh-2rem)] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Entreprises</h1>
        <FormDialog
          title="Nouvelle Entreprise"
          description="Ajoutez une entreprise pour y associer des contacts et des opportunités."
          trigger={
            <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" />
            </Button>
          }
        >
          {(close) => <CompanyForm onSuccess={close} />}
        </FormDialog>
      </div>

      {/* CONTENT LIST */}
      <div className="flex-1 min-h-0 pb-8">
        {isLoading ? (
          <CardListSkeleton />
        ) : sortedCompanies.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Building2 className="h-12 w-12 opacity-20" />
            <p>Aucune entreprise trouvée. Commencez par en ajouter une !</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
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
      </div>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!selectedCompany}
        onOpenChange={(open) => !open && setSelectedCompany(null)}
        title="Fiche Entreprise"
      >
        {selectedCompany && (
          <CompanyDetails
            company={selectedCompany}
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

      {/* EDIT DIALOG - Using FormDialog */}
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
    </div>
  );
}

import {
  Plus,
  Building2,
} from 'lucide-react';

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

// Logic Hook
import { useCompaniesPageLogic } from '@/hooks/companies/use-companies-page-logic';

export function CompaniesPage() {
  const logic = useCompaniesPageLogic();

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
        {logic.isLoading ? (
          <CardListSkeleton />
        ) : logic.sortedCompanies.length === 0 ? (
          <EmptyState
            icon={Building2}
            message="Aucune entreprise trouvée. Commencez par en ajouter une !"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {logic.sortedCompanies.map(company => (
              <CompanyCard
                key={company.id}
                company={company}
                onClick={logic.setSelectedCompany}
                onEdit={logic.setEditingCompany}
                onDelete={logic.setCompanyToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!logic.selectedCompany}
        onOpenChange={(open) => !open && logic.setSelectedCompany(null)}
      >
        {logic.selectedCompany && (
          <CompanyDetails
            company={logic.selectedCompany}
            products={logic.selectedCompanyProducts}
            onEdit={logic.openEditFromDetails}
            onDelete={logic.openDeleteFromDetails}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!logic.editingCompany}
        onOpenChange={(open) => !open && logic.setEditingCompany(null)}
        title="Modifier l'entreprise"
        description="Modifiez les informations de l'entreprise."
      >
        {(close) => logic.editingCompany && (
          <CompanyForm
            initialData={logic.editingCompany}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!logic.companyToDelete}
        onOpenChange={logic.closeDeleteDialog}
        entityType="entreprise"
        entityLabel={logic.companyToDelete?.name || ''}
        onConfirm={logic.handleDelete}
        isDeleting={logic.isDeleting}
        error={logic.deleteError}
      />
    </PageLayout>
  );
}

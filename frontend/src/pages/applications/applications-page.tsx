import { Briefcase, Plus, Wand2 } from 'lucide-react';

import { useApplicationsPage } from '@/hooks/applications/use-applications-page';

import { Button } from '@/components/ui/button';
import { Fab } from '@/components/ui/fab';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { EmptyState } from '@/components/shared/empty-state';
import { EntitySheet } from '@/components/shared/entity-sheet';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';
import { FormDialog } from '@/components/shared/form-dialog';

import { PageLayout } from '@/components/layouts/page-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { PageContent } from '@/components/layouts/page-content';

import { ApplicationForm } from '@/components/applications/application-form';
import { ApplicationCard } from '@/components/applications/application-card';
import { ApplicationDetails } from '@/components/applications/application-details';

export function ApplicationsPage() {
  const logic = useApplicationsPage();

  return (
    <PageLayout>
      <PageHeader
        title="Candidatures"
        search={{
          value: logic.search,
          onChange: logic.setSearch,
          placeholder: "Rechercher par poste, statut...",
        }}
        secondaryAction={
          <Button
            variant="outline"
            palette="primary"
            onClick={logic.navigateToWizard}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Assistant Candidature
          </Button>
        }
        action={
          <FormDialog
            title="Nouvelle Candidature"
            description="Suivez une nouvelle opportunité."
            trigger={<Fab><Plus className="h-5 w-5" /></Fab>}
          >
            {(close) => <ApplicationForm onSuccess={close} />}
          </FormDialog>
        }
      />

      <PageContent>
        {logic.isLoading ? (
          <CardListSkeleton />
        ) : logic.filteredApplications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            message={
              logic.search
                ? "Aucune candidature ne correspond à votre recherche."
                : "Aucune candidature en cours. Lancez-vous !"
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {logic.filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onClick={logic.setSelectedApplication}
                onEdit={logic.setEditingApplication}
                onDelete={logic.setApplicationToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!logic.selectedApplication}
        onOpenChange={(open) => !open && logic.setSelectedApplication(null)}
      >
        {logic.selectedApplication && (
          <ApplicationDetails
            application={logic.selectedApplication}
            onEdit={logic.handleEditFromDetails}
            onDelete={logic.handleDeleteFromDetails}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!logic.editingApplication}
        onOpenChange={(open) => !open && logic.setEditingApplication(null)}
        title="Modifier la candidature"
        description="Mettez à jour le statut ou les documents."
      >
        {(close) => logic.editingApplication && (
          <ApplicationForm
            initialData={logic.editingApplication}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!logic.applicationToDelete}
        onOpenChange={logic.handleCloseDeleteDialog}
        entityType="candidature"
        entityLabel={logic.deleteLabel}
        onConfirm={logic.handleDelete}
        isDeleting={logic.isDeleting}
        error={logic.deleteError}
      />
    </PageLayout>
  );
}

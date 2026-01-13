import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Briefcase } from 'lucide-react';

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

// Hooks
import { useApplications } from '@/hooks/use-applications';
import { useDeleteApplication } from '@/hooks/use-delete-application';
import { useFilteredEntities } from '@/hooks/use-filtered-entities';
import { Application } from '@/api/model';
import { getLabel, LABELS_APPLICATION_STATUS } from '@/lib/dictionaries';

// Feature Components
import { ApplicationForm } from '@/components/applications/application-form';
import { ApplicationCard } from '@/components/applications/application-card';
import { ApplicationDetails } from '@/components/applications/application-details';

export function ApplicationsPage() {
  const [search, setSearch] = useState('');
  const { applications, isLoading } = useApplications();
  const { mutate: deleteApplication, isPending: isDeleting } = useDeleteApplication();

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  // Filtering Logic
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

  // 4. Delete Handler
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

  // Helper to get title for delete dialog
  const getDeleteLabel = () => {
    if (!applicationToDelete) return '';
    return applicationToDelete.opportunity?.job_title || "cette candidature";
  };

  return (
    <PageLayout>
      <PageHeader
        title="Candidatures"
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Rechercher par poste, statut...",
        }}
        action={
          <FormDialog
            title="Nouvelle Candidature"
            description="Suivez une nouvelle opportunité."
            trigger={
              <Fab>
                <Plus className="h-5 w-5" />
              </Fab>
            }
          >
            {(close) => <ApplicationForm onSuccess={close} />}
          </FormDialog>
        }
      />

      <PageContent>
        {isLoading ? (
          <CardListSkeleton />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            message={
              search
                ? "Aucune candidature ne correspond à votre recherche."
                : "Aucune candidature en cours. Lancez-vous !"
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredApplications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onClick={setSelectedApplication}
                onEdit={setEditingApplication}
                onDelete={setApplicationToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!selectedApplication}
        onOpenChange={(open) => !open && setSelectedApplication(null)}
        title="Détail Candidature"
      >
        {selectedApplication && (
          <ApplicationDetails
            application={selectedApplication}
            onEdit={(app) => {
              setSelectedApplication(null);
              setEditingApplication(app);
            }}
            onDelete={(app) => {
              setSelectedApplication(null);
              setApplicationToDelete(app);
            }}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!editingApplication}
        onOpenChange={(open) => !open && setEditingApplication(null)}
        title="Modifier la candidature"
        description="Mettez à jour le statut ou les documents."
      >
        {(close) => editingApplication && (
          <ApplicationForm
            initialData={editingApplication}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!applicationToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setApplicationToDelete(null);
            setDeleteError('');
          }
        }}
        entityType="candidature"
        entityLabel={getDeleteLabel()}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </PageLayout>
  );
}

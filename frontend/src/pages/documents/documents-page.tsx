import {
  Plus,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Fab } from '@/components/ui/fab';
import { EmptyState } from '@/components/shared/empty-state';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";

// Layout Components
import { PageLayout } from '@/components/layouts/page-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { PageContent } from '@/components/layouts/page-content';

// Shared Components
import { FormDialog } from '@/components/shared/form-dialog';
import { EntitySheet } from '@/components/shared/entity-sheet';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';

// Feature Components
import { DocumentCard } from '@/components/documents/document-card';
import { DocumentForm } from '@/components/documents/document-form';
import { DocumentDetails } from '@/components/documents/document-details';

// Logic Hook
import { useDocumentsPageLogic } from '@/hooks/documents/use-documents-page-logic';

export function DocumentsPage() {
  const logic = useDocumentsPageLogic();

  return (
    <PageLayout>
      <PageHeader
        title="Documents"
        action={
          <FormDialog
            title="Ajouter un document"
            description="Vous pouvez uploader un fichier local ou sauvegarder un lien externe."
            trigger={
              <Fab>
                <Plus className="h-5 w-5" />
              </Fab>
            }
          >
            {(close) => <DocumentForm onSuccess={close} />}
          </FormDialog>
        }
      />

      <PageContent>
        {logic.isLoading ? (
          <CardListSkeleton />
        ) : logic.isError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            Erreur lors du chargement des documents.
          </div>
        ) : !logic.sortedDocuments || logic.sortedDocuments.length === 0 ? (
          <EmptyState
            icon={FileText}
            message="Aucun document"
            action={
              <FormDialog
                title="Ajouter un document"
                description="Vous pouvez uploader un fichier local ou sauvegarder un lien externe."
                trigger={
                  <Button variant="link" palette="primary">
                    Ajouter maintenant
                  </Button>
                }
              >
                {(close) => <DocumentForm onSuccess={close} />}
              </FormDialog>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {logic.sortedDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onClick={logic.setSelectedDocument}
                  onEdit={logic.setEditingDocument}
                  onDelete={logic.setDocumentToDelete}
                />
            ))}
          </div>
        )}
      </PageContent>

      {/* EDIT DIALOG */}
      <FormDialog
        title="Modifier le document"
        open={!!logic.editingDocument}
        onOpenChange={(open) => !open && logic.setEditingDocument(null)}
      >
        {(close) => logic.editingDocument && (
          <DocumentForm
            initialData={logic.editingDocument}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!logic.selectedDocument}
        onOpenChange={(open) => !open && logic.setSelectedDocument(null)}
        title="Détails du document"
      >
        {logic.selectedDocument && (
          <DocumentDetails
            document={logic.selectedDocument}
            onEdit={logic.openEditFromDetails}
            onDelete={logic.openDeleteFromDetails}
          />
        )}
      </EntitySheet>

      {/* DELETE CONFIRMATION */}
      <EntityDeleteDialog
        open={!!logic.documentToDelete}
        onOpenChange={logic.closeDeleteDialog}
        entityType="document"
        entityLabel={logic.documentToDelete?.name || ''}
        onConfirm={logic.handleDelete}
        isDeleting={logic.isDeleting}
        error={logic.deleteError}
      />
    </PageLayout>
  );
}

import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { useDocuments } from '@/hooks/use-documents';
import { useDeleteDocument } from '@/hooks/use-delete-document';
import { Button } from '@/components/ui/button';
import { Fab } from '@/components/ui/fab';
import { EmptyState } from '@/components/shared/empty-state';

// Layout Components
import { PageLayout } from '@/components/layouts/page-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { PageContent } from '@/components/layouts/page-content';

// Shared Components
import { FormDialog } from '@/components/shared/form-dialog';
import { EntitySheet } from '@/components/shared/entity-sheet';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";

// Feature Components
import { DocumentCard } from '@/components/documents/document-card';
import { DocumentForm } from '@/components/documents/document-form';
import { DocumentDetails } from '@/components/documents/document-details';
import { Document } from '@/api/model';

export function DocumentsPage() {
  const { documents, isLoading, isError } = useDocuments();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

  // State
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // Sorting by date (newest first)
  const sortedDocuments = documents?.slice().sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Handlers
  const handleDelete = async () => {
    if (!documentToDelete) return;
    setDeleteError('');

    deleteDocument({ documentId: documentToDelete.id }, {
      onSuccess: () => {
        toast.success('Document supprimé avec succès');
        // Close sheet if we deleted the currently viewed document
        if (selectedDocument?.id === documentToDelete.id) {
          setSelectedDocument(null);
        }
        setDocumentToDelete(null);
      },
      onError: (error) => {
        console.error('Erreur lors de la suppression:', error);
        setDeleteError("Erreur lors de la suppression du document.");
      }
    });
  };

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
        {isLoading ? (
          <CardListSkeleton />
        ) : isError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            Erreur lors du chargement des documents.
          </div>
        ) : !sortedDocuments || sortedDocuments.length === 0 ? (
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
            {sortedDocuments.map((doc) => (
              <div key={doc.id} onClick={() => setSelectedDocument(doc)} className="cursor-pointer">
                <DocumentCard
                  document={doc}
                  onEdit={setEditingDocument}
                  onDelete={setDocumentToDelete}
                />
              </div>
            ))}
          </div>
        )}
      </PageContent>

      {/* EDIT DIALOG */}
      <FormDialog
        title="Modifier le document"
        open={!!editingDocument}
        onOpenChange={(open) => !open && setEditingDocument(null)}
      >
        {(close) => editingDocument && (
          <DocumentForm
            initialData={editingDocument}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!selectedDocument}
        onOpenChange={(open) => !open && setSelectedDocument(null)}
        title="Détails du document"
      >
        {selectedDocument && (
          <DocumentDetails
            document={selectedDocument}
            onEdit={(doc) => {
              setSelectedDocument(null);
              setEditingDocument(doc);
            }}
            onDelete={(doc) => {
              setDocumentToDelete(doc);
            }}
          />
        )}
      </EntitySheet>

      {/* DELETE CONFIRMATION */}
      <EntityDeleteDialog
        open={!!documentToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setDocumentToDelete(null);
            setDeleteError('');
          }
        }}
        entityType="document"
        entityLabel={documentToDelete?.name || ''}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </PageLayout>
  );
}

import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { useDocuments } from '@/hooks/use-documents';
import { useDeleteDocument } from '@/hooks/use-delete-document';
import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/shared/form-dialog';
import { Document } from '@/api/model';

// Shared Components
import { EntitySheet } from '@/components/shared/entity-sheet';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';

// Feature Components
import { DocumentCard } from '@/components/documents/document-card';
import { DocumentForm } from '@/components/documents/document-form';
import { DocumentDetails } from '@/components/documents/document-details';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";

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
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Documents</h1>
          <p className="text-muted-foreground">
            Gérez vos fichiers (CV, Lettres) et liens externes.
          </p>
        </div>

        {/* CREATE DIALOG */}
        <FormDialog
          title="Ajouter un document"
          description="Vous pouvez uploader un fichier local ou sauvegarder un lien externe."
          trigger={
            <Button
              size="icon"
              className="h-10 w-10 bg-primary hover:bg-[#e84232] text-white rounded-full shadow-lg transition-transform hover:scale-105"
              title="Ajouter un document"
            >
              <Plus className="h-6 w-6" />
            </Button>
          }
        >
          {(close) => <DocumentForm onSuccess={close} />}
        </FormDialog>
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {isLoading ? (
          <CardListSkeleton />
        ) : isError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            Erreur lors du chargement des documents.
          </div>
        ) : !sortedDocuments || sortedDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 p-12 text-center">
            <div className="mb-4 rounded-full bg-white/10 p-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Aucun document</h3>
            <div className="mt-4">
              <FormDialog
                title="Ajouter un document"
                trigger={
                  <Button variant="link" className="text-primary">
                    Ajouter maintenant
                  </Button>
                }
              >
                {(close) => <DocumentForm onSuccess={close} />}
              </FormDialog>
            </div>
          </div>
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
      </div>

      {/* EDIT DIALOG - Using FormDialog */}
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
    </div>
  );
}

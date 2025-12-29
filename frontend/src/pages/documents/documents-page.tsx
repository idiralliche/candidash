import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { useDocuments } from '@/hooks/use-documents';
import { useDeleteDocument } from '@/hooks/use-delete-document';
import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/form-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { EntityDeleteDialog } from '@/shared/components/entity-delete-dialog';

import { DocumentCard } from '@/components/documents/document-card';
import { DocumentForm } from '@/components/documents/document-form';
import { DocumentDetails } from '@/components/documents/document-details';
import { DocumentListSkeleton } from '@/components/documents/document-list-skeleton';
import { Document } from '@/api/model';

export function DocumentsPage() {
  const { documents, isLoading, isError } = useDocuments();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

  // --- State ---
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentToUpdate, setDocumentToUpdate] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  // Sorting
  const sortedDocuments = documents?.slice().sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // --- Handlers ---

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleEdit = (doc: Document) => {
    setSelectedDocument(null);
    setDocumentToUpdate(doc);
  };

  const closeSheet = () => {
    setSelectedDocument(null);
  };

  const handleDeleteRequest = (doc: Document) => {
    setDocumentToDelete(doc);
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;
    setDeleteError('');

    try {
      await deleteDocument({ documentId: documentToDelete.id });
      toast.success('Document supprimé avec succès');

      // Close sheet if we deleted the currently viewed document
      if (selectedDocument?.id === documentToDelete.id) {
        closeSheet();
      }

      setDocumentToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setDeleteError('Une erreur est survenue lors de la suppression.');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* --- Header --- */}
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

      {/* --- Content --- */}
      <div className="min-h-[200px]">
        {isLoading ? (
          <DocumentListSkeleton />
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
              <div key={doc.id} onClick={() => handleDocumentClick(doc)} className="cursor-pointer">
                <DocumentCard
                  document={doc}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- UPDATE DIALOG --- */}
      <FormDialog
        title="Modifier le document"
        open={!!documentToUpdate}
        onOpenChange={(isOpen) => !isOpen && setDocumentToUpdate(null)}
      >
        {(close) => (
          documentToUpdate ? (
            <DocumentForm
              initialData={documentToUpdate}
              onSuccess={() => {
                close();
                setDocumentToUpdate(null);
              }}
            />
          ) : <></>
        )}
      </FormDialog>

      {/* --- DETAILS SHEET --- */}
      <Sheet open={!!selectedDocument} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="w-full sm:max-w-lg bg-[#16181d] border-l border-white/10 text-white p-0 overflow-y-auto">
          <SheetHeader className="px-6 py-4 border-b border-white/10 sticky top-0 bg-[#16181d] z-10">
            <SheetTitle className="text-white">Détails du document</SheetTitle>
          </SheetHeader>
          <div className="px-6 py-6">
            {selectedDocument && (
              <DocumentDetails
                document={selectedDocument}
                onClose={closeSheet}
                onEdit={handleEdit}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* --- DELETE CONFIRMATION --- */}
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

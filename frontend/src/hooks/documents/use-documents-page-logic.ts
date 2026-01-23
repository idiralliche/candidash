import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { useDocuments } from '@/hooks/documents/use-documents';
import { useDeleteDocument } from '@/hooks/documents/use-delete-document';
import { Document } from '@/api/model';

export function useDocumentsPageLogic() {
  const { documents, isLoading, isError } = useDocuments();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

  // --- STATE ---
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // --- SORTING ---
  const sortedDocuments = useMemo(() => {
    return documents?.slice().sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [documents]);

  // --- HANDLERS ---
  const handleDelete = async () => {
    if (!documentToDelete) return;
    setDeleteError('');

    deleteDocument({ documentId: documentToDelete.id }, {
      onSuccess: () => {
        toast.success('Document supprimé avec succès');
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

  const closeDeleteDialog = (open: boolean) => {
    if (!open) {
      setDocumentToDelete(null);
      setDeleteError('');
    }
  };

  const openEditFromDetails = (doc: Document) => {
    setSelectedDocument(null);
    setEditingDocument(doc);
  };

  const openDeleteFromDetails = (doc: Document) => {
    setDocumentToDelete(doc);
  };

  return {
    // Data
    sortedDocuments,
    isLoading,
    isError,

    // State
    selectedDocument,
    setSelectedDocument,
    editingDocument,
    setEditingDocument,
    documentToDelete,
    setDocumentToDelete,
    deleteError,
    isDeleting,

    // Handlers
    handleDelete,
    closeDeleteDialog,
    openEditFromDetails,
    openDeleteFromDetails,
  };
}

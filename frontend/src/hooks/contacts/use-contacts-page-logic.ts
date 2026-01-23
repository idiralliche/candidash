import { useState } from 'react';
import { toast } from 'sonner';

import { useContacts } from '@/hooks/contacts/use-contacts';
import { useDeleteContact } from '@/hooks/contacts/use-delete-contact';
import { useFilteredEntities } from '@/hooks/shared/use-filtered-entities';
import { Contact } from '@/api/model';

export function useContactsPageLogic() {
  const { contacts, isLoading } = useContacts();
  const { mutateAsync: deleteContact, isPending: isDeleting } = useDeleteContact();

  // --- STATE ---
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');

  // --- FILTERING & SORTING ---
  const filteredContacts = useFilteredEntities({
    entities: contacts,
    searchTerm: search,
    searchFields: (contact) => [
      contact.first_name,
      contact.last_name,
      contact.email || '',
      contact.company?.name || '',
      contact.position || '',
    ],
    sortFn: (a, b) => {
      const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
      const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();
      return nameA.localeCompare(nameB);
    },
  });

  // --- HANDLERS ---
  const handleDelete = async () => {
    if (!contactToDelete) return;
    setDeleteError('');
    try {
      await deleteContact({ contactId: contactToDelete.id });
      toast.success('Contact supprimé avec succès');
      setContactToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setDeleteError('Une erreur est survenue lors de la suppression.');
    }
  };

  const closeDeleteDialog = (open: boolean) => {
    if (!open) {
      setContactToDelete(null);
      setDeleteError('');
    }
  };

  const openEditFromDetails = (contact: Contact) => {
    setSelectedContact(null);
    setEditingContact(contact);
  };

  const openDeleteFromDetails = (contact: Contact) => {
    setSelectedContact(null);
    setContactToDelete(contact);
  };

  return {
    // Data
    filteredContacts,
    isLoading,

    // Search State
    search,
    setSearch,

    // UI State
    selectedContact,
    setSelectedContact,
    contactToDelete,
    setContactToDelete,
    editingContact,
    setEditingContact,
    deleteError,
    isDeleting,

    // Handlers
    handleDelete,
    closeDeleteDialog,
    openEditFromDetails,
    openDeleteFromDetails,
  };
}

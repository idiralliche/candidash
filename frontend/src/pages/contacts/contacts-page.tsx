import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Search, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { EntitySheet } from '@/components/shared/entity-sheet';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';
import { FormDialog } from '@/components/shared/form-dialog';

import { useContacts } from '@/hooks/use-contacts';
import { useDeleteContact } from '@/hooks/use-delete-contact';
import { useFilteredEntities } from '@/hooks/use-filtered-entities';
import { Contact } from '@/api/model';

import { ContactForm } from '@/components/contacts/contact-form';
import { ContactCard } from '@/components/contacts/contact-card';
import { ContactDetails } from '@/components/contacts/contact-details';

export function ContactsPage() {
  const [search, setSearch] = useState('');

  const { contacts, isLoading } = useContacts();
  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [deleteError, setDeleteError] = useState<string>('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Filter and sort contacts with relevance-based ordering
  const filteredContacts = useFilteredEntities({
    entities: contacts,
    searchTerm: search,
    searchFields: (contact) => [
      contact.first_name,
      contact.last_name,
      contact.email || '',
    ],
    sortFn: (a, b) => {
      const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
      const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();
      return nameA.localeCompare(nameB);
    },
  });

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

  return (
    <div className="space-y-6 pt-20 h-[calc(100vh-2rem)] flex flex-col">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Contacts</h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher un nom, un email..."
              className="pl-9 bg-surface-base border-white-light text-white focus:border-orange-500/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <FormDialog
            title="Nouveau Contact"
            description="Ajoutez un interlocuteur (Recruteur, RH, Manager...)."
            trigger={
              <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" />
              </Button>
            }
          >
            {(close) => <ContactForm onSuccess={close} />}
          </FormDialog>
        </div>
      </div>

      {/* CONTENT LIST */}
      <div className="flex-1 min-h-0 pb-8">
        {isLoading ? (
          <CardListSkeleton avatarShape="circle" />
        ) : filteredContacts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Users className="h-12 w-12 opacity-20" />
            <p>
              {search ? "Aucun contact ne correspond à votre recherche." : "Votre carnet d'adresses est vide."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onClick={setSelectedContact}
                onEdit={setEditingContact}
                onDelete={setContactToDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
        title="Fiche Contact"
      >
        {selectedContact && (
          <ContactDetails
            contact={selectedContact}
            onEdit={(c) => {
              setSelectedContact(null);
              setEditingContact(c);
            }}
            onDelete={(c) => {
              setSelectedContact(null);
              setContactToDelete(c);
            }}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG - Using FormDialog */}
      <FormDialog
        open={!!editingContact}
        onOpenChange={(open) => !open && setEditingContact(null)}
        title="Modifier le contact"
        description="Mettez à jour les coordonnées ou le poste."
      >
        {(close) => editingContact && (
          <ContactForm
            initialData={editingContact}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!contactToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setContactToDelete(null);
            setDeleteError('');
          }
        }}
        entityType="contact"
        entityLabel={contactToDelete ? `${contactToDelete.first_name} ${contactToDelete.last_name}` : ''}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />

    </div>
  );
}

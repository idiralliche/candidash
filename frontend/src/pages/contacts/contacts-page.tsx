import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Users } from 'lucide-react';

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

import { useContacts } from '@/hooks/contacts/use-contacts';
import { useDeleteContact } from '@/hooks/contacts/use-delete-contact';
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
      contact.company?.name || '',
      contact.position || '',
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
    <PageLayout>
      <PageHeader
        title="Contacts"
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Rechercher un nom, une entreprise...",
        }}
        action={
          <FormDialog
            title="Nouveau Contact"
            description="Ajoutez un interlocuteur (Recruteur, RH, Manager...)."
            trigger={
              <Fab>
                <Plus className="h-5 w-5" />
              </Fab>
            }
          >
            {(close) => <ContactForm onSuccess={close} />}
          </FormDialog>
        }
      />

      <PageContent>
        {isLoading ? (
          <CardListSkeleton avatarShape="circle" />
        ) : filteredContacts.length === 0 ? (
          <EmptyState
            icon={Users}
            message={
              search
                ? "Aucun contact ne correspond à votre recherche."
                : "Votre carnet d'adresses est vide."
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
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
      </PageContent>

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

      {/* EDIT DIALOG */}
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
    </PageLayout>
  );
}

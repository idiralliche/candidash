import {
  Plus,
  Users,
} from 'lucide-react';

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

import { ContactForm } from '@/components/contacts/contact-form';
import { ContactCard } from '@/components/contacts/contact-card';
import { ContactDetails } from '@/components/contacts/contact-details';

// Logic Hook
import { useContactsPageLogic } from '@/hooks/contacts/use-contacts-page-logic';

export function ContactsPage() {
  const logic = useContactsPageLogic();

  return (
    <PageLayout>
      <PageHeader
        title="Contacts"
        search={{
          value: logic.search,
          onChange: logic.setSearch,
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
        {logic.isLoading ? (
          <CardListSkeleton avatarShape="circle" />
        ) : logic.filteredContacts.length === 0 ? (
          <EmptyState
            icon={Users}
            message={
              logic.search
                ? "Aucun contact ne correspond à votre recherche."
                : "Votre carnet d'adresses est vide."
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {logic.filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onClick={logic.setSelectedContact}
                onEdit={logic.setEditingContact}
                onDelete={logic.setContactToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!logic.selectedContact}
        onOpenChange={(open) => !open && logic.setSelectedContact(null)}
      >
        {logic.selectedContact && (
          <ContactDetails
            contact={logic.selectedContact}
            onEdit={logic.openEditFromDetails}
            onDelete={logic.openDeleteFromDetails}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!logic.editingContact}
        onOpenChange={(open) => !open && logic.setEditingContact(null)}
        title="Modifier le contact"
        description="Mettez à jour les coordonnées ou le poste."
      >
        {(close) => logic.editingContact && (
          <ContactForm
            initialData={logic.editingContact}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!logic.contactToDelete}
        onOpenChange={logic.closeDeleteDialog}
        entityType="contact"
        entityLabel={logic.contactToDelete ? `${logic.contactToDelete.first_name} ${logic.contactToDelete.last_name}` : ''}
        onConfirm={logic.handleDelete}
        isDeleting={logic.isDeleting}
        error={logic.deleteError}
      />
    </PageLayout>
  );
}

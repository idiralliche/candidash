import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Users, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useContacts } from '@/hooks/use-contacts';
import { useDeleteContact } from '@/hooks/use-delete-contact';
import { Contact } from '@/api/model';

import { FormDialog } from '@/components/form-dialog';
import { ContactForm } from '@/components/contact-form';
import { ContactCard } from '@/components/contact-card';
import { ContactDetails } from '@/components/contact-details';

export function ContactsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce manual implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms delay
    return () => clearTimeout(timer);
  }, [search]);

  const { contacts, isLoading } = useContacts();
  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // 1. Client-side filtering
  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    if (!debouncedSearch.trim()) return contacts;

    const lowerSearch = debouncedSearch.toLowerCase();
    return contacts.filter(contact => {
      const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
      const email = contact.email?.toLowerCase() || '';
      return fullName.includes(lowerSearch) || email.includes(lowerSearch);
    });
  }, [contacts, debouncedSearch]);

  // 2. Alphabetical sorting
  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
      const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [filteredContacts]);

  const handleDelete = () => {
    if (!contactToDelete) return;
    deleteContact({ contactId: contactToDelete.id }, {
      onSuccess: () => setContactToDelete(null)
    });
  };

  return (
    <div className="space-y-6 pt-20 h-[calc(100vh-2rem)] flex flex-col">

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Contacts</h1>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher un nom, un email..."
              className="pl-9 bg-[#16181d] border-white/10 text-white focus:border-orange-500/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <FormDialog
            title="Nouveau Contact"
            description="Ajoutez un interlocuteur (Recruteur, RH, Manager...)."
            trigger={
              <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-[#e84232] text-white shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" />
              </Button>
            }
          >
            {(close) => <ContactForm onSuccess={close} />}
          </FormDialog>
        </div>
      </div>

      {/* --- CONTENT LIST --- */}
      <div className="flex-1 min-h-0 pb-8">
        {isLoading ? (
          /* SKELETON ROW STYLE */
          <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
            {Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="flex items-center gap-4 bg-[#16181d] border border-white/5 rounded-xl p-4">
                  {/* RoundedAvatar */}
                  <Skeleton className="h-10 w-10 rounded-full bg-white/10 shrink-0" />
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                     <Skeleton className="h-5 w-48 bg-white/10" />
                     <Skeleton className="h-3 w-32 bg-white/5" />
                  </div>
                  <div className="flex items-center gap-3 pl-4">
                     <Skeleton className="h-4 w-24 bg-white/5 rounded hidden sm:block" />
                     <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
                  </div>
               </div>
            ))}
          </div>
        ) : sortedContacts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Users className="h-12 w-12 opacity-20" />
            <p>
              {search ? "Aucun contact ne correspond à votre recherche." : "Votre carnet d'adresses est vide."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
            {sortedContacts.map((contact) => (
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

      {/* --- DETAILS SHEET --- */}
      <Sheet open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <SheetContent className="sm:max-w-xl w-full border-l border-white/10 bg-[#16181d] text-white">
          <SheetHeader className="pb-4">
            <SheetTitle>Fiche Contact</SheetTitle>
          </SheetHeader>
          {selectedContact && (
            <ContactDetails
              contact={selectedContact}
              onClose={() => setSelectedContact(null)}
              onEdit={(c) => {
                setSelectedContact(null);
                setEditingContact(c);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* --- EDIT DIALOG --- */}
      <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent className="bg-[#13151a] border-white/10 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier le contact</DialogTitle>
            <DialogDescription className="text-gray-400">
              Mettez à jour les coordonnées ou le poste.
            </DialogDescription>
          </DialogHeader>

          {editingContact && (
            <ContactForm
              initialData={editingContact}
              onSuccess={() => setEditingContact(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --- DELETE ALERT --- */}
      <AlertDialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(null)}>
        <AlertDialogContent className="bg-[#16181d] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce contact ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Cette action est irréversible.
              <span className="font-bold text-white"> {contactToDelete?.first_name} {contactToDelete?.last_name} </span>
              sera retiré de vos listes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

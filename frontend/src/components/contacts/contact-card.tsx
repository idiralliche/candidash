import { MoreHorizontal, Pencil, Trash2, Building2, Mail, Phone, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Contact } from '@/api/model';
import { useCompanies } from '@/hooks/use-companies';
import { findEntityById } from '@/lib/utils';

interface ContactCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactCard({ contact, onClick, onEdit, onDelete }: ContactCardProps) {
  // Fetch companies for lookup
  const { companies } = useCompanies();
  const company = findEntityById(companies, contact.company_id);
  const initials = `${contact.first_name[0] || ''}${contact.last_name[0] || ''}`.toUpperCase();

  return (
    <div
      onClick={() => onClick(contact)}
      className="
        group relative flex flex-col sm:flex-row sm:items-center
        bg-surface-base border border-white-subtle rounded-xl p-4 gap-4
        transition-all duration-200
        hover:bg-surface-hover hover:border-primary/30 hover:shadow-md hover:-translate-y-[1px]
        cursor-pointer
      "
    >
      {/* ZONE 1 : IDENTITY (Left) */}
      <div className="flex items-center gap-4 min-w-0 sm:w-[45%]">
         {/* Avatar Initials */}
         <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 font-bold border border-orange-500/20 group-hover:bg-orange-500/20 transition-colors">
            {initials}
         </div>

         {/* Name & Position */}
         <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors">
                {contact.first_name} {contact.last_name}
            </h3>
            {contact.position && (
                <p className="text-xs text-gray-400 truncate">
                    {contact.position}
                </p>
            )}
         </div>
      </div>

      {/* ZONE 2 : INFO & CONTEXTE (Center) */}
      <div className="flex flex-1 items-center justify-between sm:justify-end gap-6 text-sm text-gray-400">

          {/* Company or Status */}
          <div className="flex items-center gap-2">
            {company ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-300 bg-white-subtle  px-2 py-1 rounded">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">{company.name}</span>
                </div>
            ) : contact.is_independent_recruiter ? (
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20 text-[10px] font-normal">
                    Recruteur Indép.
                </Badge>
            ) : (
                <span className="text-xs text-gray-600 italic">Aucune liaison</span>
            )}
          </div>

          {/* Contact quick icons (Visible on Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
             {contact.linkedin && <LinkIcon className="h-3.5 w-3.5 text-blue-400" />}
             {contact.email && <Mail className="h-3.5 w-3.5 text-gray-500" />}
             {contact.phone && <Phone className="h-3.5 w-3.5 text-gray-500" />}
          </div>
      </div>

      {/* ZONE 3 : ACTIONS (Right) */}
      <div className="absolute top-4 right-4 sm:static sm:pl-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white-light "
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-surface-base border-white-light text-white">
              <DropdownMenuItem
                className="cursor-pointer focus:bg-white-light  focus:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(contact);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(contact);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    </div>
  );
}

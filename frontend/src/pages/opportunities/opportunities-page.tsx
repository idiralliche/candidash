import { useState, useMemo } from 'react';
import { Plus, Briefcase, MapPin, Building2, MoreHorizontal, Trash2, Loader2, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

import { useOpportunities } from '@/hooks/use-opportunities';
import { useDeleteOpportunity } from '@/hooks/use-delete-opportunity';
import { useCompanies } from '@/hooks/use-companies';
import { LABELS_APPLICATION } from '@/lib/dictionaries';

import { FormDialog } from '@/components/form-dialog';
import { OpportunityForm } from '@/components/opportunity-form';
import { OpportunityDetails } from '@/components/opportunity-details';
import { Opportunity } from '@/api/model';

export function OpportunitiesPage() {
  const { opportunities, isLoading } = useOpportunities();
  const { companies } = useCompanies();
  const { mutate: deleteOpportunity, isPending: isDeleting } = useDeleteOpportunity();

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [opportunityToDelete, setOpportunityToDelete] = useState<Opportunity | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  const getCompany = (id?: string | number | null) => {
    if (!id || !companies) return undefined;
    return companies.find(c => c.id === Number(id));
  };

  // Tri par défaut (Alphabétique par titre)
  const sortedOpportunities = useMemo(() => {
    if (!opportunities) return [];
    return [...opportunities].sort((a, b) =>
      a.job_title.localeCompare(b.job_title)
    );
  }, [opportunities]);

  const handleDelete = () => {
    if (!opportunityToDelete) return;
    deleteOpportunity({ opportunityId: opportunityToDelete.id }, {
      onSuccess: () => setOpportunityToDelete(null)
    });
  };

  return (
    <div className="space-y-6 pt-20 h-[calc(100vh-2rem)] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Opportunités</h1>
        <FormDialog
          title="Nouvelle Opportunité"
          description="Ajoutez une nouvelle opportunité à votre pipeline."
          trigger={
            <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-[#e84232] text-white shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" />
            </Button>
          }
        >
          {(close) => <OpportunityForm onSuccess={close} />}
        </FormDialog>
      </div>

      {/* CONTENT LIST */}
      <div className="flex-1 min-h-0 pb-8">
        {isLoading ? (
          <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
            {Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="flex items-center gap-4 bg-[#16181d] border border-white/5 rounded-xl p-4">
                  {/* Icône Carrée */}
                  <Skeleton className="h-10 w-10 rounded-lg bg-white/10 shrink-0" />

                  {/* Titre + Entreprise */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                     <Skeleton className="h-5 w-56 bg-white/10" />
                     <Skeleton className="h-3 w-40 bg-white/5" />
                  </div>

                  {/* Badge + Location (Droite) */}
                  <div className="flex items-center gap-6 pl-4">
                     <Skeleton className="h-6 w-24 rounded-full bg-white/5 hidden sm:block" />
                     <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
                  </div>
               </div>
            ))}
          </div>
        ) : sortedOpportunities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Briefcase className="h-12 w-12 opacity-20" />
            <p>Aucune opportunité trouvée. Commencez par en ajouter une !</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
            {sortedOpportunities.map((opportunity) => {
              const company = getCompany(opportunity.company_id);

              return (
                <div
                  key={opportunity.id}
                  onClick={() => setSelectedOpportunity(opportunity)}
                  className="
                    group relative flex flex-col sm:flex-row sm:items-center
                    bg-[#16181d] border border-white/5 rounded-xl p-4 gap-4
                    transition-all duration-200
                    hover:bg-[#1c1f26] hover:border-primary/30 hover:shadow-md hover:-translate-y-[1px]
                    cursor-pointer
                  "
                >
                  {/* ZONE 1 : IDENTITÉ (Gauche) */}
                  <div className="flex items-center gap-4 min-w-0 sm:w-[45%]">
                     {/* Petit Carré Icône (Émeraude) */}
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                        <Briefcase className="h-5 w-5" />
                     </div>

                     {/* Titre & Entreprise */}
                     <div className="flex flex-col gap-1 min-w-0">
                        <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors">
                            {opportunity.job_title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                           <Building2 className="h-3 w-3" />
                           <span className="truncate">{company?.name || 'Entreprise inconnue'}</span>
                        </div>
                     </div>
                  </div>

                  {/* ZONE 2 : INFO (Distribuées) */}
                  <div className="flex flex-1 items-center justify-between sm:justify-end gap-6 text-sm text-gray-400">

                      {/* Badge Type de candidature */}
                      <Badge variant="secondary" className="bg-white/5 text-gray-400 hover:bg-white/10 border-none font-normal shrink-0">
                         {LABELS_APPLICATION[opportunity.application_type] || opportunity.application_type}
                      </Badge>

                      {/* Location */}
                      {opportunity.location ? (
                          <div className="flex items-center gap-2 truncate text-xs sm:mx-auto">
                              <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                              <span className="truncate max-w-[150px]">{opportunity.location}</span>
                          </div>
                      ) : (
                          <div className="hidden sm:block sm:mx-auto" />
                      )}
                  </div>

                  {/* ZONE 3 : ACTIONS (Droite) */}
                  <div className="absolute top-4 right-4 sm:static sm:pl-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#16181d] border-white/10 text-white">
                          <DropdownMenuItem
                            className="cursor-pointer focus:bg-white/10 focus:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingOpportunity(opportunity);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpportunityToDelete(opportunity);
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
            })}
          </div>
        )}
      </div>

      {/* --- DETAILS SHEET --- */}
      <Sheet open={!!selectedOpportunity} onOpenChange={(open) => !open && setSelectedOpportunity(null)}>
        <SheetContent className="sm:max-w-xl w-full border-l border-white/10 bg-[#16181d] text-white">
          <SheetHeader className="pb-4">
            <SheetTitle>Détails de l'opportunité</SheetTitle>
          </SheetHeader>
          {selectedOpportunity && (
            <OpportunityDetails
              opportunity={selectedOpportunity}
              company={getCompany(selectedOpportunity.company_id)}
              onClose={() => setSelectedOpportunity(null)}
              onEdit={(op) => {
                setSelectedOpportunity(null);
                setEditingOpportunity(op);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* --- EDIT DIALOG --- */}
      <Dialog open={!!editingOpportunity} onOpenChange={(open) => !open && setEditingOpportunity(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col bg-[#13151a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Modifier l'opportunité</DialogTitle>
            <DialogDescription className="text-gray-400">
              Mettez à jour les informations du poste.
            </DialogDescription>
          </DialogHeader>

          {editingOpportunity && (
            <OpportunityForm
              initialData={editingOpportunity}
              onSuccess={() => setEditingOpportunity(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <AlertDialog open={!!opportunityToDelete} onOpenChange={(open) => !open && setOpportunityToDelete(null)}>
        <AlertDialogContent className="bg-[#16181d] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'opportunité ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Cette action est irréversible. L'opportunité
              <span className="font-bold text-white"> {opportunityToDelete?.job_title} </span>
              sera supprimée définitivement.
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

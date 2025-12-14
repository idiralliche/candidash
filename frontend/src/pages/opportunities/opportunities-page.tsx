import { useState } from 'react';
import { Plus, Briefcase, MapPin, Building2, MoreHorizontal, Trash2, Loader2, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const handleDelete = () => {
    if (!opportunityToDelete) return;
    deleteOpportunity({ opportunityId: opportunityToDelete.id }, {
      onSuccess: () => setOpportunityToDelete(null)
    });
  };

  return (
    <div className="space-y-8 pt-20">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Opportunités</h1>
        <FormDialog
          title="Nouvelle Opportunité"
          description="Ajoutez une nouvelle opportunité à votre pipeline."
          trigger={
            <Button size="icon" className="h-8 w-8 rounded-full bg-primary hover:bg-[#e84232] text-white">
              <Plus className="h-5 w-5" />
            </Button>
          }
        >
          {(close) => <OpportunityForm onSuccess={close} />}
        </FormDialog>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="flex flex-col rounded-xl bg-[#16181d] p-8 shadow-lg">
               <div className="mb-4 h-[72px] w-[72px] rounded-xl bg-white/5" />
               <Skeleton className="mb-3 h-6 w-3/4 bg-white/10" />
               <Skeleton className="h-4 w-1/2 bg-white/10" />
             </div>
          ))
        ) : opportunities?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            Aucune opportunité trouvée. Commencez par en ajouter une !
          </div>
        ) : (
          opportunities?.map((opportunity) => {
            const company = getCompany(opportunity.company_id);

            return (
              <Card
                key={opportunity.id}
                onClick={() => setSelectedOpportunity(opportunity)}
                className="relative flex flex-col items-center border-none bg-[#16181d] p-6 text-center shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1c1f26] cursor-pointer group"
              >
                {/* --- ACTION MENU (TOP RIGHT) --- */}
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#16181d] border-white/10 text-white">

                      {/* OPTION MODIFIER */}
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

                      {/* OPTION SUPPRIMER */}
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

                {/* --- CARD CONTENT --- */}
                <CardHeader className="p-0 pb-4 w-full flex flex-col items-center">
                  <div className="mb-4 inline-flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <Briefcase className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    {opportunity.job_title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                     <Building2 className="h-4 w-4" />
                     <span className="truncate max-w-[200px]">
                       {company?.name || 'Entreprise inconnue'}
                     </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 p-0 w-full">
                  <div className="flex justify-center pb-2">
                    <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-white">
                      {LABELS_APPLICATION[opportunity.application_type] || opportunity.application_type}
                    </Badge>
                  </div>
                  {opportunity.location && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate max-w-[200px]">{opportunity.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Modifier l'opportunité</DialogTitle>
            <DialogDescription>
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

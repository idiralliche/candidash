import { useState, useMemo } from 'react';
import { Plus, Globe, MapPin, MoreHorizontal, Trash2, Loader2, Pencil, Building2 } from 'lucide-react';
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

import { useCompanies } from '@/hooks/use-companies';
import { useDeleteCompany } from '@/hooks/use-delete-company';
import { FormDialog } from '@/components/form-dialog';
import { CompanyForm } from '@/components/company-form';
import { CompanyDetails } from '@/components/company-details';
import { Company } from '@/api/model';

export function CompaniesPage() {
  const { companies, isLoading } = useCompanies();
  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const sortedCompanies = useMemo(() => {
    if (!companies) return [];
    return [...companies].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [companies]);

  const handleDelete = () => {
    if (!companyToDelete) return;
    deleteCompany({ companyId: companyToDelete.id }, {
      onSuccess: () => setCompanyToDelete(null)
    });
  };

  return (
    <div className="space-y-6 pt-20 h-[calc(100vh-2rem)] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Entreprises</h1>
        <FormDialog
          title="Nouvelle Entreprise"
          description="Ajoutez une entreprise pour y associer des contacts et des opportunités."
          trigger={
            <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-[#e84232] text-white shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" />
            </Button>
          }
        >
          {(close) => <CompanyForm onSuccess={close} />}
        </FormDialog>
      </div>

      {/* CONTENT LIST */}
      <div className="flex-1 min-h-0 pb-8">
        {isLoading ? (
          <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
            {Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="flex items-center gap-4 bg-[#16181d] border border-white/5 rounded-xl p-4">
                  {/* Square Icon */}
                  <Skeleton className="h-10 w-10 rounded-lg bg-white/10 shrink-0" />

                  {/* Infos Text */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                     <Skeleton className="h-5 w-48 bg-white/10" />
                     <Skeleton className="h-3 w-32 bg-white/5 hidden sm:block" />
                  </div>

                  {/* Actions Button */}
                  <div className="flex items-center gap-3 pl-4">
                     <Skeleton className="h-8 w-24 bg-white/5 rounded hidden sm:block" /> {/* Website btn */}
                     <Skeleton className="h-8 w-8 rounded-full bg-white/5" /> {/* Menu btn */}
                  </div>
               </div>
            ))}
          </div>
        ) : sortedCompanies.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Building2 className="h-12 w-12 opacity-20" />
            <p>Aucune entreprise trouvée. Commencez par en ajouter une !</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-5xl mx-auto w-full">
            {sortedCompanies.map((company) => (
              <div
                key={company.id}
                onClick={() => setSelectedCompany(company)}
                className="
                  group relative flex flex-col sm:flex-row sm:items-center
                  bg-[#16181d] border border-white/5 rounded-xl p-4 gap-4
                  transition-all duration-200
                  hover:bg-[#1c1f26] hover:border-primary/30 hover:shadow-md hover:-translate-y-[1px]
                  cursor-pointer
                "
              >
                {/* ZONE 1 : IDENTITY (Left) */}
                <div className="flex items-center gap-4 min-w-0 sm:w-[40%]">
                   {/* Little square icon */}
                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                      <Building2 className="h-5 w-5" />
                   </div>

                   {/* Name & Badge */}
                   <div className="flex flex-col gap-1 min-w-0">
                      <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors">
                          {company.name}
                      </h3>
                      {company.industry && (
                        <Badge variant="secondary" className="w-fit text-[10px] bg-white/5 text-gray-400 hover:bg-white/10 border-none h-5 px-1.5 font-normal">
                            {company.industry}
                        </Badge>
                      )}
                   </div>
                </div>

                {/* ZONE 2 : SECONDARY INFO (Center) */}
                <div className="flex flex-1 items-center justify-between sm:justify-end gap-6 text-sm text-gray-400">

                    {/* Location (Visible if enough space) */}
                    {company.headquarters ? (
                        <div className="flex items-center gap-2 truncate sm:mx-auto">
                            <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                            <span className="truncate max-w-[150px]">{company.headquarters}</span>
                        </div>
                    ) : (
                        <div className="hidden sm:block sm:mx-auto" /> /* Empty placeholder to keep spacing consistent */
                    )}

                    {/* Website (discrete link) */}
                    {company.website && (
                        <div
                            className="hidden sm:flex items-center gap-1.5 text-xs text-blue-400/80 hover:text-blue-400 hover:underline px-2 py-1 rounded cursor-pointer z-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (company.website) window.open(company.website, '_blank', 'noopener,noreferrer');
                            }}
                        >
                            <Globe className="h-3 w-3" />
                            Visiter le site
                        </div>
                    )}
                </div>

                {/* ZONE 3 : ACTIONS (Fixed Right) */}
                <div className="absolute top-4 right-4 sm:static sm:pl-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#16181d] border-white/10 text-white z-50">
                            <DropdownMenuItem
                                className="cursor-pointer focus:bg-white/10 focus:text-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCompany(company);
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCompanyToDelete(company);
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SHEET DETAILS --- */}
      <Sheet open={!!selectedCompany} onOpenChange={(open) => !open && setSelectedCompany(null)}>
        <SheetContent className="sm:max-w-xl w-full border-l border-white/10 bg-[#16181d] text-white">
          <SheetHeader className="pb-4">
            <SheetTitle>Fiche Entreprise</SheetTitle>
          </SheetHeader>
          {selectedCompany && (
            <CompanyDetails
              company={selectedCompany}
              onClose={() => setSelectedCompany(null)}
              onEdit={(company) => {
                setSelectedCompany(null);
                setEditingCompany(company);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* --- EDIT DIALOG --- */}
      <Dialog open={!!editingCompany} onOpenChange={(open) => !open && setEditingCompany(null)}>
        <DialogContent className="bg-[#13151a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Modifier l'entreprise</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les informations de l'entreprise.
            </DialogDescription>
          </DialogHeader>

          {editingCompany && (
            <CompanyForm
              initialData={editingCompany}
              onSuccess={() => setEditingCompany(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --- DELETE ALERT --- */}
      <AlertDialog open={!!companyToDelete} onOpenChange={(open) => !open && setCompanyToDelete(null)}>
        <AlertDialogContent className="bg-[#16181d] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'entreprise ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Cette action est irréversible. L'entreprise
              <span className="font-bold text-white"> {companyToDelete?.name} </span>
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

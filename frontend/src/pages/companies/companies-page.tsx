import { useState } from 'react';
import { Plus, Building2, Globe, MapPin, Briefcase, MoreHorizontal, Trash2, Loader2, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

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

  const handleDelete = () => {
    if (!companyToDelete) return;
    deleteCompany({ companyId: companyToDelete.id }, {
      onSuccess: () => setCompanyToDelete(null)
    });
  };

  return (
    <div className="space-y-8 pt-20">
      {/* HEADER + CREATION BUTTON */}
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Entreprises</h1>
        <FormDialog
          title="Nouvelle Entreprise"
          description="Ajoutez une entreprise pour y associer des contacts et des opportunités."
          trigger={
            <Button size="icon" className="h-8 w-8 rounded-full bg-primary hover:bg-[#e84232] text-white">
              <Plus className="h-5 w-5" />
            </Button>
          }
        >
          {(close) => <CompanyForm onSuccess={close} />}
        </FormDialog>
      </div>

      {/* COMPANIES GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="flex flex-col rounded-xl bg-[#16181d] p-8 shadow-lg">
               <div className="mb-4 h-[72px] w-[72px] rounded-xl bg-white/5" />
               <Skeleton className="mb-3 h-6 w-3/4 bg-white/10" />
               <Skeleton className="h-4 w-1/2 bg-white/10" />
             </div>
          ))
        ) : companies?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            Aucune entreprise trouvée. Commencez par en ajouter une !
          </div>
        ) : (
          companies?.map((company) => (
            <Card
              key={company.id}
              onClick={() => setSelectedCompany(company)}
              className="relative flex flex-col items-center border-none bg-[#16181d] p-6 text-center shadow-lg transition-all hover:-translate-y-1 hover:bg-[#1c1f26] cursor-pointer group"
            >
              {/* --- ACTIONS MENU --- */}
              <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#16181d] border-white/10 text-white">

                    {/* Edit */}
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

                    {/* Delete */}
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

              {/* Card content */}
              <CardHeader className="p-0 pb-4 w-full flex flex-col items-center">
                <div className="mb-4 inline-flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-bold text-white">{company.name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 p-0 w-full flex flex-col items-center">
                {company.industry && (
                  <p className="font-medium text-primary flex items-center gap-2">
                    <Briefcase className="h-3 w-3" />
                    {company.industry}
                  </p>
                )}
                {company.headquarters && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">{company.headquarters}</span>
                  </div>
                )}
                {company.website && (
                  <div className="pt-2 max-w-full">
                    <Button
                      variant="outline" size="sm"
                      className="h-8 gap-2 border-white/10 bg-white/5 text-xs text-white hover:bg-white/10 hover:text-primary max-w-[200px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (company.website) window.open(company.website, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <Globe className="h-3 w-3 shrink-0" />
                      Visiter le site
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'entreprise</DialogTitle>
            <DialogDescription>
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

      {/* --- DELETE CONFIRMATION ALERT --- */}
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

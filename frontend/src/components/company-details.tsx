import {
  Building2, MapPin, Globe, FileText,
  CheckCircle2, Hash, Briefcase, Trash2, Loader2, Pencil
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Company } from '@/api/model';
import { useDeleteCompany } from '@/hooks/use-delete-company';

interface CompanyDetailsProps {
  company: Company;
  onClose?: () => void;
  onEdit?: (company: Company) => void;
}

export function CompanyDetails({ company, onClose, onEdit }: CompanyDetailsProps) {
  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();

  const handleDelete = () => {
    deleteCompany({ companyId: company.id }, {
      onSuccess: () => {
        if (onClose) onClose();
      }
    });
  };

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6 pb-10">

        {/* HEADER */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white leading-tight">
                {company.name}
              </h2>
              {company.industry && (
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Briefcase className="h-4 w-4" />
                  <span>{company.industry}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  onClick={() => onEdit(company)}
                >
                  <Pencil className="h-5 w-5" />
                </Button>
              )}
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-muted-foreground">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {company.company_type && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20">
                {company.company_type}
              </Badge>
            )}
            {company.is_intermediary && (
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Intermédiaire / ESN
              </Badge>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        {company.website && (
          <Button variant="outline" className="w-full justify-start text-blue-400 hover:text-blue-300 border-blue-500/20 bg-blue-500/10 h-auto py-2" asChild>
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center">
              <Globe className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">{company.website}</span>
            </a>
          </Button>
        )}

        <Separator className="bg-white/10" />

        {/* INFO GRID */}
        <div className="grid grid-cols-1 gap-4">
          {company.headquarters && (
            <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
              <MapPin className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-white text-sm">Siège social</p>
                <p className="text-sm text-muted-foreground">{company.headquarters}</p>
              </div>
            </div>
          )}

          {company.siret && (
            <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
              <Hash className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-white text-sm">SIRET</p>
                <p className="text-sm text-muted-foreground tracking-wider font-mono">
                  {company.siret}
                </p>
                <a
                  href={`https://www.pappers.fr/recherche?q=${company.siret}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-1 block"
                >
                  Voir sur Pappers.fr ↗
                </a>
              </div>
            </div>
          )}
        </div>

        {/* NOTES */}
        {company.notes && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <h3 className="font-semibold text-white">Notes & Informations</h3>
            </div>
            <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed bg-[#0f1115] p-3 rounded-md border border-white/5">
              {company.notes}
            </div>
          </div>
        )}

        {/* DELETE ACTION */}
        <div className="pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer l'entreprise
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#16181d] border-white/10 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Cette action est irréversible. Cela supprimera définitivement l'entreprise
                  <span className="font-bold text-white"> {company.name} </span>
                  ainsi que tous les contacts et opportunités associés.
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

      </div>
    </ScrollArea>
  );
}

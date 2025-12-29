import {
  Building2, MapPin, Globe, FileText, CheckCircle2,
  Hash, Briefcase, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Company } from "@/api/model";
import { EntityDetailsSheet } from "@/shared/components/entity-details-sheet";

interface CompanyDetailsProps {
  company: Company;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
}

export function CompanyDetails({ company, onEdit, onDelete }: CompanyDetailsProps) {

  return (
    <EntityDetailsSheet
      title={company.name}
      // Badges: Industry, Intermediary, Company Type
      metadata={
        <>
          {company.industry && (
            <div className="flex items-center gap-2 text-primary font-medium">
              <Briefcase className="h-4 w-4" />
              <span>{company.industry}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1 w-full">
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
        </>
      }
      onEdit={onEdit ? () => onEdit(company) : undefined}
      footer={
        onDelete && (
           <Button
             variant="ghost"
             className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-400"
             onClick={() => onDelete(company)}
           >
             <Trash2 className="mr-2 h-4 w-4" />
             Supprimer l'entreprise
           </Button>
        )
      }
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-muted-foreground mb-4">
        <Building2 className="h-6 w-6" />
      </div>

      {/* WEBSITE ACTION */}
      {company.website && (
        <div className="mb-6">
           <Button
             variant="outline"
             className="w-full justify-start text-blue-400 hover:text-blue-300 border-blue-500/20 bg-blue-500/10 h-auto py-2"
             asChild
           >
             <a
               href={company.website}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center"
             >
               <Globe className="mr-2 h-4 w-4 shrink-0" />
               <span className="truncate">{company.website}</span>
             </a>
           </Button>
        </div>
      )}

      <Separator className="bg-white/10 mb-6" />

      {/* INFO GRID */}
      <div className="grid grid-cols-1 gap-4 mb-6">

        {/* Headquarters */}
        {company.headquarters && (
          <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
            <MapPin className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-white text-sm">Siège social</p>
              <p className="text-sm text-muted-foreground">{company.headquarters}</p>
            </div>
          </div>
        )}

        {/* SIRET */}
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
                Voir sur Pappers.fr
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
    </EntityDetailsSheet>
  );
}

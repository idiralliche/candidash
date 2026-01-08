import {
  MapPin,
  Globe,
  FileText,
  CheckCircle2,
  Hash,
  Briefcase,
  Trash2,

} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Company } from "@/api/model";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import { DetailsBlock } from "@/components/shared/details-block";

interface CompanyDetailsProps {
  company: Company;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
}

export function CompanyDetails({ company, onEdit, onDelete }: CompanyDetailsProps) {

  return (
    <EntityDetailsSheet
      title={company.name}

      badge={company.is_intermediary && (
        <Badge
          variant="subtle"
          palette="orange"
          className="gap-1"
        >
          <CheckCircle2 className="h-3 w-3" />
          Intermédiaire / ESN
        </Badge>
      )}

      // Badges: Industry, Company Type
      metadata={
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-1 w-full">
          {company.industry && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>{company.industry}</span>
            </div>
          )}

          {company.company_type && (
            <Badge
              variant="subtle"
              palette="gray"
              className="text-xs"
            >
              {company.company_type}
            </Badge>
          )}
        </div>
      }
      onEdit={onEdit ? () => onEdit(company) : undefined}
      footer={
        onDelete && (
           <Button
             variant="ghost"
             palette="destructive"
             className="w-full"
             onClick={() => onDelete(company)}
           >
             <Trash2 className="mr-2 h-4 w-4" />
             Supprimer l'entreprise
           </Button>
        )
      }
    >
      {/* WEBSITE ACTION */}
      {company.website && (
        <div className="mb-6">
           <Button
             variant="outline"
             palette="blue"
             className="w-full justify-start"
             asChild
           >
             <a
               href={company.website}
               target="_blank"
               rel="noopener noreferrer"
             >
               <Globe className="mr-2 h-4 w-4" />
               <span className="truncate">{company.website}</span>
             </a>
           </Button>
        </div>
      )}

      <Separator className="bg-white-light mb-6" />

      {/* INFO GRID */}
      <div className="grid grid-cols-1 gap-3">

        {/* Headquarters */}
        {company.headquarters && (
          <DetailsBlock icon={MapPin} label="Siège social">
            {company.headquarters}
          </DetailsBlock>
        )}

        {/* SIRET */}
        {company.siret && (
          <DetailsBlock
            icon={Hash}
            label="SIRET"
            action={
              <a
                href={`https://www.pappers.fr/recherche?q=${company.siret}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline block"
              >
                Voir sur Pappers.fr
              </a>
            }
          >
            <span className="font-mono tracking-wider">{company.siret}</span>
          </DetailsBlock>
        )}
      </div>

      {/* NOTES */}
      {company.notes && (
        <DetailsBlock icon={FileText} label="Notes & Informations">
          <div className="whitespace-pre-wrap leading-relaxed">
            {company.notes}
          </div>
        </DetailsBlock>
      )}
    </EntityDetailsSheet>
  );
}

import {
  Building2, MapPin, Banknote, Laptop, Calendar,
  Link as LinkIcon, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Opportunity, Company } from "@/api/model";
import { EntityDetailsSheet } from "@/shared/components/entity-details-sheet";
import {
  LABELS_APPLICATION, LABELS_CONTRACT, LABELS_REMOTE, getLabel
} from "@/lib/dictionaries";

interface OpportunityDetailsProps {
  opportunity: Opportunity;
  company?: Company;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
}

export function OpportunityDetails({
  opportunity,
  company,
  onEdit,
  onDelete
}: OpportunityDetailsProps) {

  // Salary formatting helper
  const formatSalary = (min?: number | null, max?: number | null, info?: string | null) => {
    if (min == null && max == null) return null;
    let text = "";
    if (min != null && max != null) text = `${min / 1000}k - ${max / 1000}k`;
    else if (min != null) text = `> ${min / 1000}k`;
    else if (max != null) text = `< ${max / 1000}k`;

    return (
      <div className="flex flex-col">
        <span className="font-medium text-white">{text}</span>
        {info && <span className="text-xs text-muted-foreground">{info}</span>}
      </div>
    );
  };

  return (
    <EntityDetailsSheet
      title={opportunity.job_title}
      // Status Badge (Application Type)
      badge={
        <Badge variant="outline" className="mb-2 bg-white/5 text-white border-white/10 hover:bg-white/10">
          {getLabel(LABELS_APPLICATION, opportunity.application_type)}
        </Badge>
      }
      // Metadata: Company, Location, Contract
      metadata={
        <>
          <div className="flex items-center gap-2 text-primary font-medium w-full sm:w-auto">
            <Building2 className="h-5 w-5" />
            <span className="text-lg">{company?.name || "Entreprise inconnue"}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-1 w-full">
            {opportunity.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {opportunity.location}
              </div>
            )}

            {opportunity.contract_type && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {getLabel(LABELS_CONTRACT, opportunity.contract_type)}
              </div>
            )}

            {opportunity.position_type && (
              <Badge variant="secondary" className="text-xs bg-white/5 hover:bg-white/10">
                {opportunity.position_type}
              </Badge>
            )}
          </div>
        </>
      }
      onEdit={onEdit ? () => onEdit(opportunity) : undefined}
      footer={
        onDelete && (
          <Button
            variant="ghost"
            className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => onDelete(opportunity)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer l'opportunité
          </Button>
        )
      }
    >
      {/* ACTIONS ROW */}
      {opportunity.job_posting_url && (
        <div className="mb-6">
          <Button
            variant="outline"
            className="w-full justify-start text-blue-400 hover:text-blue-300 border-blue-500/20 bg-blue-500/10"
            asChild
          >
            <a
              href={opportunity.job_posting_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Voir l'annonce originale
            </a>
          </Button>
        </div>
      )}

      <Separator className="bg-white/10 mb-6" />

      {/* INFO GRID (Remote & Salary) */}
      <div className="grid grid-cols-1 gap-4 mb-6">

        {/* Remote Policy */}
        {opportunity.remote_policy && (
          <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
            <Laptop className="h-5 w-5 text-purple-400 mt-0.5" />
            <div>
              <p className="font-medium text-white text-sm">Politique Télétravail</p>
              <p className="text-sm text-muted-foreground">
                {getLabel(LABELS_REMOTE, opportunity.remote_policy)}
              </p>
              {opportunity.remote_details && (
                <p className="text-xs text-gray-500 mt-1">{opportunity.remote_details}</p>
              )}
            </div>
          </div>
        )}

        {/* Salary */}
        {(opportunity.salary_min != null || opportunity.salary_max != null) && (
          <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
            <Banknote className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-white text-sm">Rémunération</p>
              <div className="text-sm">
                {formatSalary(opportunity.salary_min, opportunity.salary_max, opportunity.salary_info)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DESCRIPTION & SKILLS */}
      <div className="space-y-6">
        {/* Job Description */}
        {opportunity.job_description && (
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Description du poste</h3>
            <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed bg-[#0f1115] p-3 rounded-md border border-white/5">
              {opportunity.job_description}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Required Skills */}
          {opportunity.required_skills && (
            <div className="space-y-2">
              <h3 className="font-semibold text-white text-sm">Compétences requises</h3>
              <div className="text-xs text-gray-400 whitespace-pre-wrap bg-[#0f1115] p-3 rounded-md border border-white/5 h-full">
                {opportunity.required_skills}
              </div>
            </div>
          )}

          {/* Technologies */}
          {opportunity.technologies && (
            <div className="space-y-2">
              <h3 className="font-semibold text-white text-sm">Technologies</h3>
              <div className="text-xs text-gray-400 whitespace-pre-wrap bg-[#0f1115] p-3 rounded-md border border-white/5 h-full">
                {opportunity.technologies}
              </div>
            </div>
          )}
        </div>

        {/* Recruitment Process */}
        {opportunity.recruitment_process && (
          <div className="space-y-2">
            <h3 className="font-semibold text-white">Processus de recrutement</h3>
            <div className="text-sm text-gray-300 whitespace-pre-wrap bg-[#0f1115] p-3 rounded-md border border-white/5">
              {opportunity.recruitment_process}
            </div>
          </div>
        )}
      </div>
    </EntityDetailsSheet>
  );
}

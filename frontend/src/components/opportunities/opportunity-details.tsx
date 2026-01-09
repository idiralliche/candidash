import {
  Building2,
  MapPin,
  Banknote,
  Laptop,
  Calendar,
  Link as LinkIcon,
  Trash2,
  Star,
  CodeXml,
  FileText,
  ListCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Opportunity,
  Company,
} from "@/api/model";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import { DetailsBlock } from "@/components/shared/details-block";
import {
  LABELS_APPLICATION,
  LABELS_CONTRACT,
  LABELS_REMOTE,
  getLabel,
} from "@/lib/dictionaries";
import { getApplicationTypePalette } from '@/lib/semantic-ui';

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
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (min == null && max == null) return null;
    let text = "";
    if (min != null && max != null) text = `${min / 1000}k - ${max / 1000}k`;
    else if (min != null) text = `> ${min / 1000}k`;
    else if (max != null) text = `< ${max / 1000}k`;

    return text;
  };

  return (
    <EntityDetailsSheet
      title={opportunity.job_title}
      badge={
        <Badge
          variant="subtle"
          palette={getApplicationTypePalette(opportunity.application_type)}
          className="mb-2"
        >
          {getLabel(LABELS_APPLICATION, opportunity.application_type)}
        </Badge>
      }
      metadata={
        <>
          {company?.name && (
            <div className="flex items-center gap-2 rounded border border-white-light bg-white-subtle px-3 py-1.5 text-primary font-bold mb-2">
              <Building2 className="h-4 w-4" />
              {company.name}
            </div>
          )}

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
              <Badge
                variant="subtle"
                palette="gray"
                className="text-xs"
              >
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
            palette="destructive"
            className="w-full"
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
            palette="blue"
            className="w-full justify-start"
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

      <Separator className="bg-white-light mb-6" />

      {/* INFO GRID (Remote & Salary) */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Remote Policy */}
        {opportunity.remote_policy && (
          <DetailsBlock icon={Laptop} label="Remote">
            <p>{getLabel(LABELS_REMOTE, opportunity.remote_policy)}</p>
            {opportunity.remote_details && (
              <p className="text-xs text-muted-foreground mt-1">{opportunity.remote_details}</p>
            )}
          </DetailsBlock>
        )}

        {/* Salary */}
        {(opportunity.salary_min != null || opportunity.salary_max != null) && (
          <DetailsBlock icon={Banknote} label="Rémunération">
            <p>{formatSalary(opportunity.salary_min, opportunity.salary_max)}</p>
            {opportunity.salary_info && (
              <p className="text-xs text-muted-foreground mt-1">{opportunity.salary_info}</p>
            )}
          </DetailsBlock>
        )}
      </div>

      {/* DESCRIPTION & SKILLS */}
      <div className="space-y-6">

        {/* Job Description */}
        {opportunity.job_description && (
          <DetailsBlock icon={FileText} label="Description du poste">
            <div className="whitespace-pre-wrap leading-relaxed">
               {opportunity.job_description}
            </div>
          </DetailsBlock>
        )}

        {/* Technologies */}
        {opportunity.technologies && (
          <DetailsBlock icon={CodeXml} label="Technologies">
            <div className="whitespace-pre-wrap leading-relaxed">
              {opportunity.technologies}
            </div>
          </DetailsBlock>
        )}

        {/* Required Skills */}
        {opportunity.required_skills && (
          <DetailsBlock icon={Star} label="Compétences requises">
             <div className="whitespace-pre-wrap leading-relaxed">
               {opportunity.required_skills}
             </div>
          </DetailsBlock>
        )}

        {/* Recruitment Process */}
        {opportunity.recruitment_process && (
          <DetailsBlock icon={ListCheck} label="Processus de recrutement">
             <div className="whitespace-pre-wrap leading-relaxed">
               {opportunity.recruitment_process}
             </div>
          </DetailsBlock>
        )}
      </div>
    </EntityDetailsSheet>
  );
}

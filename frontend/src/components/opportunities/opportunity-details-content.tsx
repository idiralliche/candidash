import {
  Building2,
  Banknote,
  Laptop,
  Star,
  CodeXml,
  FileText,
  ListCheck,
} from "lucide-react";
import { Opportunity } from "@/api/model";
import { DetailsBlock } from "@/components/shared/details-block";
import { CompanyCard } from '@/components/companies/company-card';
import { OpportunityProductsList } from '@/components/opportunities/opportunity-products-list';

import {
  LABELS_REMOTE,
  getLabel,
} from "@/lib/dictionaries";
import { formatSalary } from "@/lib/utils";

export function OpportunityDetailsContent({ opportunity }: { opportunity: Opportunity; }) {
  const company = opportunity.company;

  return (
    <>
      {/* Company */}
      {company?.name && (
        <DetailsBlock
          icon={Building2}
          label="Entreprise"
          variant="card"
        >
          <CompanyCard
            key={company.id}
            company={company}
            variant="minimal"
            isHighlighted
          />
        </DetailsBlock>
      )}

      {/* Remote Policy */}
      {opportunity.remote_policy && (
        <DetailsBlock
          icon={Laptop}
          label="Remote"
        >
          <p>{getLabel(LABELS_REMOTE, opportunity.remote_policy)}</p>
          {opportunity.remote_details && (
            <p className="text-xs text-muted-foreground mt-1">{opportunity.remote_details}</p>
          )}
        </DetailsBlock>
      )}

      {/* Salary */}
      {(opportunity.salary_min != null || opportunity.salary_max != null || opportunity.salary_info) && (
        <DetailsBlock
          icon={Banknote}
          label="Rémunération"
        >
          {(opportunity.salary_min != null || opportunity.salary_max != null) && (
            <p className="font-mono tracking-wider">
              {formatSalary(opportunity.salary_min, opportunity.salary_max)}
            </p>
          )}

          {opportunity.salary_info && (
            <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">
              {opportunity.salary_info}
            </p>
          )}
        </DetailsBlock>
      )}

      {/* PRODUCTS SECTION (ASYNC) */}
      <OpportunityProductsList opportunityId={opportunity.id} />

      {/* Job Description */}
      {opportunity.job_description && (
        <DetailsBlock
          icon={FileText}
          label="Description du poste"
        >
          {opportunity.job_description}
        </DetailsBlock>
      )}

      {/* Technologies */}
      {opportunity.technologies && (
        <DetailsBlock
          icon={CodeXml}
          label="Technologies"
        >
          {opportunity.technologies}
        </DetailsBlock>
      )}

      {/* Required Skills */}
      {opportunity.required_skills && (
        <DetailsBlock
          icon={Star}
          label="Compétences requises"
        >
          {opportunity.required_skills}
        </DetailsBlock>
      )}

      {/* Recruitment Process */}
      {opportunity.recruitment_process && (
        <DetailsBlock
          icon={ListCheck}
          label="Processus de recrutement"
        >
          {opportunity.recruitment_process}
        </DetailsBlock>
      )}
    </>
  );
}

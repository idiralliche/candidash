import {
  Briefcase,
  FileText,
  AlertTriangle,
  Banknote,
  Mail,
} from "lucide-react";
import { LinkCard } from "@/components/shared/link-card";

import { Application, Opportunity } from "@/api/model";
import { DetailsBlock } from "@/components/shared/details-block";
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { formatSalary } from '@/lib/utils.ts';
import { useDownloadDocument } from '@/hooks/documents/use-download-document';

export function ApplicationDetailsContent({
  application,
  opportunity,
}: {
  application: Application;
  opportunity: Opportunity
}) {
  const { downloadDocument, isDownloading } = useDownloadDocument();
  const resume = application.resume_used;
  const coverLetter = application.cover_letter;
  const hasResume = !!resume;
  const hasCoverLetter = !!coverLetter;

  const getResumeAndCoverLetterBlockLabel = () => {
    if (hasResume && hasCoverLetter) return "CV & LM";
    if (hasResume) return "CV";
    if (hasCoverLetter) return 'Lettre de motivation';
    return null;
  }

  return (
    <>
      {/* OPPORTUNITY CONTEXT */}
        {opportunity ? (
          <DetailsBlock
            icon={Briefcase}
            label="Opportunité"
            variant="card"
          >
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              variant="minimal"
              isHighlighted
            />
          </DetailsBlock>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-md bg-orange-50 border border-orange-100 text-orange-800 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold">Opportunité introuvable</span>
              <span className="text-xs opacity-90">
                L'opportunité associée n'a pas pu être chargée.
              </span>
            </div>
          </div>
        )}

      {/* SALARY EXPECTATIONS */}
      {application.salary_expectation && (
        <DetailsBlock
          icon={Banknote}
          label="Prétentions Salariales"
        >
          {formatSalary(application.salary_expectation)}
        </DetailsBlock>
      )}

      {/* DOCUMENTS SECTION */}
      {(hasResume || hasCoverLetter) && (
        <DetailsBlock
          className="space-y-4"
          icon={hasResume ? FileText : Mail}
          label={getResumeAndCoverLetterBlockLabel() || ""}
          variant="list"

        >
          {hasResume && (
            <LinkCard
              icon={FileText}
              label="Curriculum Vitae"
              value={resume.name}
              onClick={() => downloadDocument(resume)}
              isLoading={isDownloading}
              variant="blue"
              isExternal={resume.is_external}
            />
          )}

          {hasCoverLetter && (
            <LinkCard
              icon={Mail}
              label="Lettre de Motivation"
              value={coverLetter.name}
              onClick={() => downloadDocument(coverLetter)}
              isLoading={isDownloading}
              variant="default"
              isExternal={coverLetter.is_external}
            />
          )}
        </DetailsBlock>
      )}
    </>
  );
}

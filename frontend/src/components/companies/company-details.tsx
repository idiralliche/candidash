import {
  Globe,
  CheckCircle2,
  Briefcase,
} from "lucide-react";

import { Company } from "@/api/model";
import { Product } from "@/api/model";

import { Badge } from "@/components/ui/badge";
import { CompanyDetailsContent } from '@/components/companies/company-details-content';
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import {
  DetailsMetaInfoBlock,
  DetailsMetaLinkButton,
  DetailsMetaInfoRowContainer,
} from "@/components/shared/details-meta-info-block";

interface CompanyDetailsProps {
  company: Company;
  products?: Product[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyDetails({
  company,
  products,
  onEdit,
  onDelete,
}: CompanyDetailsProps) {
  return (
    <EntityDetailsSheet
      entityName="entreprise"
      onDelete={() => onDelete(company)}
    >
      <EntityDetailsSheet.Header>
        <EntityDetailsSheet.Badges>
          {company.is_intermediary && (
            <Badge
              variant="subtle"
              palette="orange"
            >
              <CheckCircle2 className="h-3 w-3" />
              Intermédiaire / ESN
            </Badge>
          )}
        </EntityDetailsSheet.Badges>

        <EntityDetailsSheet.TitleRow
          title={company.name}
          onEdit={() => onEdit(company)}
        />

        <EntityDetailsSheet.Metadata>

          <DetailsMetaInfoRowContainer>
            {company.industry && (
              <DetailsMetaInfoBlock
                icon={Briefcase}
                label={company.industry}
                firstLetterCase="upperCase"
              />
            )}

            {company.company_type && (
              <Badge
                variant="subtle"
                palette="gray"
              >
                {company.company_type}
              </Badge>
            )}
          </DetailsMetaInfoRowContainer>

          {company.website && (
            <DetailsMetaLinkButton
              href={company.website}
              icon={Globe}
              label={company.website}
            />
          )}

        </EntityDetailsSheet.Metadata>
      </EntityDetailsSheet.Header>

      <CompanyDetailsContent
        company={company}
        products={products}
      />
    </EntityDetailsSheet>
  );
}

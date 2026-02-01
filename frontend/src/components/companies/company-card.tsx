import { ReactNode } from 'react';
import {
  Building2,
  MapPin,
  Globe,
  FingerprintPattern,
} from "lucide-react";
import { Company } from "@/api/model";
import { CardInfoBlock } from '@/components/shared/card-info-block';
import { EntityCard } from "@/components/shared/entity-card";
import { Button } from '@/components/ui/button.tsx';

interface CompanyCardProps {
  company: Company;
  onClick?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  variant?: "default" | "compact" | "minimal";
  isHighlighted?: boolean;
  badges?: ReactNode;
  extraActions?: ReactNode;
}

export function CompanyCard({
  company,
  onClick,
  onEdit,
  onDelete,
  variant ="default",
  isHighlighted = false,
  badges,
  extraActions,
}: CompanyCardProps) {
  const isCompact = variant === "compact";
  const isMinimal = variant === "minimal";

  return (
    <EntityCard
      onClick={onClick && (() => onClick(company))}
      isHighlighted={isHighlighted}
      isMinimal={isMinimal}
    >

      {/* IDENTITY ZONE */}
      <EntityCard.Identity
        // IconBox default -> palette: "primary"
        // isHighlighted -> palette: "blue"!
        icon={Building2}
      >
        <EntityCard.Info
          title={company.name}
          subtitle={company.industry && (
            <CardInfoBlock icon={FingerprintPattern}>
              {company.industry}
            </CardInfoBlock>
          )}
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Meta>
        <div className="flex justify-start min-w-0">
          {!isCompact && company.headquarters && (
            <CardInfoBlock icon={MapPin}>
              {company.headquarters}
            </CardInfoBlock>
          )}
        </div>

        <div className="flex justify-start lg:justify-center">
          {badges}
        </div>

        <div className="flex justify-start lg:justify-end min-w-0">
          {!isCompact && company.website && (
            <Button
              variant="link"
              palette="blue"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.open(company.website!, "_blank", "noopener,noreferrer");
              }}
            >
              <Globe className="h-3 w-3" />
              Visiter le site
            </Button>
          )}
        </div>
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(company))}
        onDelete={onDelete && (() => onDelete(company))}
      >
        {extraActions}
      </EntityCard.Actions>
    </EntityCard>
  );
}

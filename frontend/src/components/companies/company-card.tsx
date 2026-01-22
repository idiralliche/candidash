import { ReactNode } from 'react';
import {
  Building2,
  MapPin,
  Globe,
  FingerprintPattern,
} from "lucide-react";
import { IconBox } from "@/components/ui/icon-box";
import { Company } from "@/api/model";
import { EntityCard } from "@/components/shared/entity-card";
import { Button } from '@/components/ui/button.tsx';

interface CompanyCardProps {
  company: Company;
  onClick?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  variant?: "default" | "compact";
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

  return (
    <EntityCard
      onClick={onClick && (() => onClick(company))}
      hoverPalette={isHighlighted ? "blue" : "primary"}
      className={onClick ? "cursor-pointer" : "cursor-default"}
    >

      {/* IDENTITY ZONE */}
      <EntityCard.Identity>
        <IconBox
          palette={isHighlighted ? "blue" : "red"}
          groupHover
        >
          <Building2 className="h-5 w-5" />
        </IconBox>

        <EntityCard.Info
          title={company.name}
          subtitle={company.industry && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <FingerprintPattern className="h-3 w-3" />
                <span className="truncate">
                  {company.industry}
                </span>
              </div>
          )}
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      <EntityCard.Meta>
        <div className="flex justify-start min-w-0 items-center gap-2">
          {!isCompact && company.headquarters && (
            <>
              <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
              <span className="truncate max-w-[150px]">
                {company.headquarters}
              </span>
            </>
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
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(company))}
        onDelete={onDelete && (() => onDelete(company))}
      >
        {extraActions}
      </EntityCard.Actions>
    </EntityCard>
  );
}

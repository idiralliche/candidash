import { ReactNode } from 'react';
import {
  Building2,
  MapPin,
  Globe,
  FingerprintPattern,
  Star,
} from "lucide-react";
import { IconBox } from "@/components/ui/icon-box";
import { Badge } from '@/components/ui/badge';
import { Company } from "@/api/model";
import { EntityCard } from "@/components/shared/entity-card";

interface CompanyCardProps {
  company: Company;
  onClick?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  isLinked?: boolean;
  customActions?: ReactNode;
}

export function CompanyCard({
  company,
  onClick,
  onEdit,
  onDelete,
  isLinked = false,
  customActions,
}: CompanyCardProps) {
  return (
    <EntityCard
      onClick={onClick && (() => onClick(company))}
      hoverPalette={isLinked ? "blue" : "primary"}
      className={onClick ? "cursor-pointer" : "cursor-default"}
    >

      {/* IDENTITY ZONE */}
      <EntityCard.Identity>
        <IconBox
          palette={isLinked ? "blue" : "red"}
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
        {isLinked && (
          <div className="sm:mx-auto">
            <Badge
              variant="subtle"
              palette="blue"
            >
              <Star className="mr-2 h-4 w-4" />
              Principale
            </Badge>
          </div>
        )}

        {onEdit && (
          <>
            {/* Headquarters */}
            <div className={`${company.headquarters ? "flex items-center gap-2" : "hidden sm:block "} sm:mx-auto`}>
              {company.headquarters && (
                <>
                  <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                  <span className="truncate max-w-[150px]">
                    {company.headquarters}
                  </span>
                </>
              )}
            </div>

            {/* Website */}
            {company.website && (
              <div
                className="hidden sm:flex items-center gap-1.5 text-xs text-blue-400/80 hover:text-blue-400 hover:underline px-2 py-1 rounded cursor-pointer z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(company.website!, "_blank", "noopener,noreferrer");
                }}
              >
                <Globe className="h-3 w-3" />
                Visiter le site
              </div>
            )}
          </>
        )}
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(company))}
        onDelete={onDelete && (() => onDelete(company))}
        customActions={customActions}
      />
    </EntityCard>
  );
}

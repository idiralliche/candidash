import {
  Building2,
  MapPin,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Company } from "@/api/model";
import { EntityCard } from "@/components/shared/entity-card";

interface CompanyCardProps {
  company: Company;
  onClick: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyCard({ company, onClick, onEdit, onDelete }: CompanyCardProps) {
  return (
    <EntityCard onClick={() => onClick(company)}>

      {/* IDENTITY ZONE */}
      <EntityCard.Identity>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
          <Building2 className="h-5 w-5" />
        </div>

        <EntityCard.Info
          title={company.name}
          subtitle={
            company.industry && (
              <Badge variant="subtle" palette="gray" className="w-fit font-normal">
                {company.industry}
              </Badge>
            )
          }
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      <EntityCard.Meta>
        {company.headquarters ? (
          <div className="flex items-center gap-2 truncate sm:mx-auto">
            <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            <span className="truncate max-w-[150px]">
              {company.headquarters}
            </span>
          </div>
        ) : (
          <div className="hidden sm:block sm:mx-auto" />
        )}

        {/* Custom Action: Website Link */}
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
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      <EntityCard.Actions
        onEdit={() => onEdit(company)}
        onDelete={() => onDelete(company)}
      />

    </EntityCard>
  );
}

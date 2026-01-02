import {
  Building2,
  MapPin,
  Globe,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Company } from "@/api/model";

interface CompanyCardProps {
  company: Company;
  onClick: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyCard({ company, onClick, onEdit, onDelete }: CompanyCardProps) {
  return (
    <div
      onClick={() => onClick(company)}
      className="
        group relative flex flex-col sm:flex-row sm:items-center
        bg-surface-base border border-white-subtle rounded-xl p-4 gap-4
        transition-all duration-200
        hover:bg-surface-hover hover:border-primary/30 hover:shadow-md hover:-translate-y-[1px]
        cursor-pointer
      "
    >
      {/* ZONE 1 : IDENTITY (Left) */}
      <div className="flex items-center gap-4 min-w-0 sm:w-[40%]">
        {/* Little square icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
          <Building2 className="h-5 w-5" />
        </div>

        {/* Name & Badge */}
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors">
            {company.name}
          </h3>
          {company.industry && (
            <Badge
              variant="secondary"
              className="w-fit text-[10px] bg-white-subtle text-gray-400 hover:bg-white-light border-none h-5 px-1.5 font-normal"
            >
              {company.industry}
            </Badge>
          )}
        </div>
      </div>

      {/* ZONE 2 : SECONDARY INFO (Center) */}
      <div className="flex flex-1 items-center justify-between sm:justify-end gap-6 text-sm text-gray-400">
        {/* Location (Visible if enough space) */}
        {company.headquarters ? (
          <div className="flex items-center gap-2 truncate sm:mx-auto">
            <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            <span className="truncate max-w-[150px]">
              {company.headquarters}
            </span>
          </div>
        ) : (
          <div className="hidden sm:block sm:mx-auto" /> /* Empty placeholder to keep spacing consistent */
        )}

        {/* Website (discrete link) */}
        {company.website && (
          <div
            className="hidden sm:flex items-center gap-1.5 text-xs text-blue-400/80 hover:text-blue-400 hover:underline px-2 py-1 rounded cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation();
              if (company.website)
                window.open(company.website, "_blank", "noopener,noreferrer");
            }}
          >
            <Globe className="h-3 w-3" />
            Visiter le site
          </div>
        )}
      </div>

      {/* ZONE 3 : ACTIONS (Fixed Right) */}
      <div className="absolute top-4 right-4 sm:static sm:pl-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-surface-base border-white-light text-white"
          >
            <DropdownMenuItem
              className="cursor-pointer focus:bg-white-light focus:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(company);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-600/10 focus:text-red-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(company);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

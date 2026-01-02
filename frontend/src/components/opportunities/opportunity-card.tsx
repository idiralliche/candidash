import {
  Briefcase,
  Building2,
  MapPin,
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
import {
  Opportunity,
  Company,
} from "@/api/model";
import {
  LABELS_APPLICATION,
  getLabel,
} from "@/lib/dictionaries";

interface OpportunityCardProps {
  opportunity: Opportunity;
  company?: Company;
  onClick: (opportunity: Opportunity) => void;
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (opportunity: Opportunity) => void;
}

export function OpportunityCard({
  opportunity,
  company,
  onClick,
  onEdit,
  onDelete,
}: OpportunityCardProps) {
  return (
    <div
      onClick={() => onClick(opportunity)}
      className="
        group relative flex flex-col sm:flex-row sm:items-center
        bg-surface-base border border-white-subtle rounded-xl p-4 gap-4
        transition-all duration-200
        hover:bg-surface-hover hover:border-primary/30 hover:shadow-md hover:-translate-y-[1px]
        cursor-pointer
      "
    >
      {/* ZONE 1 : IDENTITY (Left) */}
      <div className="flex items-center gap-4 min-w-0 sm:w-[45%]">
        {/* Little square icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
          <Briefcase className="h-5 w-5" />
        </div>

        {/* Title & Company */}
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors">
            {opportunity.job_title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Building2 className="h-3 w-3" />
            <span className="truncate">
              {company?.name || "Entreprise inconnue"}
            </span>
          </div>
        </div>
      </div>

      {/* ZONE 2 : INFO (Center) */}
      <div className="flex flex-1 items-center justify-between sm:justify-end gap-6 text-sm text-gray-400">
        {/* Badge Application Type */}
        <Badge
          variant="secondary"
          className="bg-white-subtle  text-gray-400 hover:bg-white-light  border-none font-normal shrink-0"
        >
          {getLabel(LABELS_APPLICATION, opportunity.application_type)}
        </Badge>

        {/* Location */}
        {opportunity.location ? (
          <div className="flex items-center gap-2 truncate text-xs sm:mx-auto">
            <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
            <span className="truncate max-w-[150px]">
              {opportunity.location}
            </span>
          </div>
        ) : (
          <div className="hidden sm:block sm:mx-auto" />
        )}
      </div>

      {/* ZONE 3 : ACTIONS (Right) */}
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
              className="cursor-pointer focus:bg-white-light  focus:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(opportunity);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-600 focus:bg-red-600/10 focus:text-red-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(opportunity);
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

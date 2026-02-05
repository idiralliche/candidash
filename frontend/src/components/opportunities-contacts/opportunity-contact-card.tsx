import {
  Briefcase,
  Building2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Contact as ContactIcon,
  Award,
  Unplug,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EntityCard } from "@/components/shared/entity-card";
import { CardInfoBlock } from '@/components/shared/card-info-block';
import { OpportunityContact } from "@/api/model";
import { IconBox } from '@/components/ui/icon-box';
import { ScrollArea } from "@/components/ui/scroll-area";


const TYPE_CONFIG = {
  contact: {
    icon: ContactIcon,
    iconBoxPalette: 'purple' as const,
    iconBoxShape: 'square' as const,
  },
  opportunity: {
    icon: Briefcase,
    iconBoxPalette: 'emerald' as const,
    iconBoxShape: 'circle' as const,
  },
} as const;


interface OpportunityContactCardProps {
  onEdit: (assoc: OpportunityContact) => void;
  onDelete: (assoc: OpportunityContact) => void;
  isHighlighted?: boolean;
  assoc: OpportunityContact;
  type: 'opportunity' | 'contact'
  title: string;
}


export function OpportunityContactCard({
  onEdit,
  onDelete,
  isHighlighted,
  assoc,
  type,
  title,
}: OpportunityContactCardProps) {
  const isOpportunity = 'opportunity' === type;
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  const opportunity = assoc.opportunity;
  const contact = assoc.contact;
  const subtitle = (isOpportunity && opportunity?.company) ? (
    <CardInfoBlock icon={Building2}>
      {opportunity.company.name}
    </CardInfoBlock>
  ) : (!isOpportunity && contact?.position) ? (
    <CardInfoBlock icon={Award}>
      {contact.position}
    </CardInfoBlock>
  ) : null;


  return (
    <EntityCard isHighlighted={isHighlighted} >
      {/* IDENTITY ZONE */}
      <div className="flex flex-row items-center gap-4 w-48 shrink-0">
        <IconBox
          groupHover
          palette={isHighlighted ? "blue" : config.iconBoxPalette}
          shape={config.iconBoxShape}
        >
          <Icon className="h-5 w-5"/>
        </IconBox>
        <EntityCard.Info
          title={title}
          subtitle={subtitle}
        />
      </div>

      <div className={"col-span-1 w-full flex mt-2 md:col-span-1 md:w-auto md:mt-0 md:justify-end md:gap-2 md:items-center"}>
         <div className="absolute top-4 right-4 md:static">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  palette="gray"
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 bg-surface-base border-white-light text-white p-0 max-h-max overflow-y-auto"

                  onClick={(e) => {e.stopPropagation(); e.preventDefault();}}
              >
                <DropdownMenuLabel className='w-full h-full sticky top-0 flex items-center p-4 gap-2 justify-between opacity-1 z-10 bg-surface-base border-b border-white-light'>
                  <span className='truncate font-semibold text-sm tracking-wider text-muted-foreground first-letter:capitalize py-2'>{title}</span>
                  {isHighlighted && (
                    <Badge
                      variant="subtle"
                      palette="blue"
                      className="text-xs h-5"
                    >
                      Principal
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                  <ScrollArea className="h-80">
                  {assoc.contact_role && (
                      <DropdownMenuItem className="rounded-none w-full flex flex-col justify-start items-center p-4" onClick={(e) => {e.stopPropagation(); e.preventDefault();}}>
                        <h3 className="w-full text-xs font-bold text-gray-500 uppercase flex items-center gap-2 select-none">
                          <Award className="h-3.5 w-3.5" />
                          <span className="first-letter:uppercase">Rôle</span>
                        </h3>
                        <p className="w-full whitespace-pre-wrap leading-relaxed text-sm text-gray-200 text-start">
                          {assoc.contact_role}
                        </p>
                      </DropdownMenuItem>
                  )}
                  {assoc.origin && (
                    <>
                      <DropdownMenuSeparator className="bg-white-light my-0 opacity-30"/>
                      <DropdownMenuItem className="rounded-none w-full flex flex-col justify-start items-center p-4" onClick={(e) => {e.stopPropagation(); e.preventDefault();}}>
                        <h3 className="w-full text-xs font-bold text-gray-500 uppercase flex items-center gap-2 select-none">
                          <Unplug className="h-3.5 w-3.5" />
                          <span className="first-letter:uppercase">Origine</span>
                        </h3>
                        <p className="w-full whitespace-pre-wrap leading-relaxed text-sm text-gray-200 text-start">
                          {assoc.origin}
                        </p>
                      </DropdownMenuItem>
                    </>
                  )}
                  {assoc.notes && (
                    <>
                      <DropdownMenuSeparator className="bg-white-light my-0 opacity-30"/>
                      <DropdownMenuItem className="rounded-none w-full flex flex-col justify-start items-center p-4" onClick={(e) => {e.stopPropagation(); e.preventDefault();}}>
                        <h3 className="w-full text-xs font-bold text-gray-500 uppercase flex items-center gap-2 select-none">
                          <FileText className="h-3.5 w-3.5" />
                          <span className="first-letter:uppercase">Notes</span>
                        </h3>
                        <p className="w-full whitespace-pre-wrap leading-relaxed text-sm text-gray-200 text-start">
                          {assoc.notes}
                        </p>
                      </DropdownMenuItem>
                    </>
                  )}
                  </ScrollArea>
                </DropdownMenuGroup>
                <DropdownMenuGroup className="flex flex-row gap-2 justify-evenly sticky bottom-0 bg-surface-base opacity-1 border-t border-white-light p-4">
                  <DropdownMenuItem
                    className="px-5 py-2"
                    onClick={(e) => { e.stopPropagation(); onEdit(assoc); }}
                  >
                    <Pencil className="h-4 w-4" />Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:bg-red-600/10 focus:text-red-600 cursor-pointer px-5 py-2"
                    onClick={(e) => { e.stopPropagation(); onDelete(assoc); }}
                  >
                    <Trash2 className="h-4 w-4" />Supprimer
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </div>
    </EntityCard>
  );
}

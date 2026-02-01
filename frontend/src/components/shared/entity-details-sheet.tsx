import {
  ReactNode,
  MouseEvent
} from "react";

import {
  Pencil,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { genderMap } from "@/lib/semantic-ui";

import {
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface EntityDetailsSheetProps {
  entityName: string;
  onDelete: (e: MouseEvent) => void;
  children: ReactNode;
}

function EntityDetailsSheet({
  entityName,
  onDelete,
  children,
}: EntityDetailsSheetProps) {
  let { article } = (genderMap[entityName] || { article: "le "});
  article = article.toLowerCase();

  return (
    <>
      <SheetHeader className="pb-4">
        <SheetTitle>
          Détail {article === "le " ? "du " : `de ${article}`}{entityName}
        </SheetTitle>
      </SheetHeader>

      <ScrollArea className="h-full pr-4">
        <div className="space-y-6 pb-10">

          {/* CONTENT */}
          {children}

          {/* FOOTER */}
          <div className="pt-6">
            <Button
              variant="ghost"
              palette="destructive"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onDelete!(e);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer {article}{entityName}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}

export function Header ({ children }: { children: ReactNode; }) {
  return (
    <>
      <div className="space-y-2">
        {children}
      </div>
      <Separator className="bg-white-light my-4" />
    </>
  );
}

export function Badges ({ children }: { children: ReactNode; }) {
  return (children && (
    <div className="flex justify-start gap-2">
      {children}
    </div>
  ));
}

interface TitleRowProps {
  title: string;
  onEdit: (e: MouseEvent) => void;
}

export function TitleRow ({
  title,
  onEdit,
}: TitleRowProps) {

  return (
    <div className="flex items-start justify-between gap-4">
      <h2 className="text-2xl font-bold text-white leading-tight text-pretty first-letter:uppercase">
        {title}
      </h2>

      {/* EDIT BUTTON */}
      <Button
        variant="outline"
        palette="gray"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onEdit!(e);
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function Metadata ({ children, className }: { children?: ReactNode; className?: string}) {
  return (children && (
    <div className={cn("flex flex-wrap gap-3 text-sm text-muted-foreground pt-1 w-full", className)}>
      {children}
    </div>
  ));
}

EntityDetailsSheet.Header = Header;
EntityDetailsSheet.Badges = Badges;
EntityDetailsSheet.TitleRow = TitleRow;
EntityDetailsSheet.Metadata = Metadata;

export { EntityDetailsSheet };

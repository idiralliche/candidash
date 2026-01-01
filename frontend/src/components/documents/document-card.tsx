import { MoreHorizontal, Trash2, FileText, Link as LinkIcon, Download, Calendar, Loader2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Document } from '@/api/model';
import { LABELS_DOCUMENT_FORMAT, getLabel } from '@/lib/dictionaries';
import { getFormatBadgeVariant, getIconColorClass } from '@/lib/assign-colors'
import { useDownloadDocument } from '@/hooks/use-download-document';

interface DocumentCardProps {
  document: Document;
  onDelete: (document: Document) => void;
  onEdit: (document: Document) => void;
}

export function DocumentCard({ document, onDelete, onEdit }: DocumentCardProps) {
  const { downloadDocument, isDownloading } = useDownloadDocument();

  const getIcon = () => {
    if (document.is_external) return <LinkIcon className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadDocument(document);
  };

  return (
    <div className="group relative flex flex-col sm:flex-row sm:items-center bg-surface-base border border-white-subtle rounded-xl p-4 gap-4 transition-all duration-200 hover:bg-surface-hover hover:border-primary/30 hover:shadow-md hover:-translate-y-[1px]">

      {/* IDENTITY */}
      <div className="flex items-center gap-4 min-w-0 sm:w-[45%]">
         <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${getIconColorClass(document.format)} transition-colors`}>
            {getIcon()}
         </div>

         <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors">
                {document.name}
            </h3>
            <p className="text-xs text-gray-400 truncate capitalize">
                {document.type}
            </p>
         </div>
      </div>

      {/* CONTEXT */}
      <div className="flex flex-1 items-center justify-between sm:justify-end gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getFormatBadgeVariant(document.format)} text-[10px] px-2 py-0.5 h-5`}>
                {getLabel(LABELS_DOCUMENT_FORMAT, document.format)}
            </Badge>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs">
             <Calendar className="h-3.5 w-3.5 text-gray-500" />
             <span>{format(new Date(document.created_at), 'dd MMM yyyy', { locale: fr })}</span>
          </div>
      </div>

      {/* ACTIONS */}
      <div className="absolute top-4 right-4 sm:static sm:pl-2 flex items-center gap-1">
          {/* Quick Download Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white-light  hidden sm:flex"
            onClick={handleDownloadClick}
            disabled={isDownloading}
            title={document.is_external ? "Ouvrir le lien" : "Télécharger"}
          >
            {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : document.is_external ? (
                <LinkIcon className="h-4 w-4" />
            ) : (
                <Download className="h-4 w-4" />
            )}
          </Button>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white-light "
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-surface-base border-white-light text-white">

              <DropdownMenuItem
                className="cursor-pointer focus:bg-white-light  focus:text-white"
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit(document);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(document);
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

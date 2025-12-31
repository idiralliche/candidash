import {
  FileText, Calendar, Link as LinkIcon, Download, HardDrive, Loader2, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { Document } from '@/api/model';
import { LABELS_DOCUMENT_FORMAT, getLabel } from '@/lib/dictionaries';
import { getFormatBadgeVariant } from '@/lib/assign-colors';
import { useDownloadDocument } from '@/hooks/use-download-document';
import { EntityDetailsSheet } from '@/components/shared/entity-details-sheet';

interface DocumentDetailsProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
}

export function DocumentDetails({ document, onEdit, onDelete }: DocumentDetailsProps) {
  const { downloadDocument, isDownloading } = useDownloadDocument();

  return (
    <EntityDetailsSheet
      title={document.name}
      // Badge Format
      badge={
        <Badge variant="outline" className={`${getFormatBadgeVariant(document.format)} mb-2`}>
          {getLabel(LABELS_DOCUMENT_FORMAT, document.format)}
        </Badge>
      }
      // Metadata: Type, Date, Storage
      metadata={
        <>
          <div className="flex items-center gap-2 text-primary font-medium capitalize">
            <FileText className="h-5 w-5" />
            <span className="text-lg">{document.type}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-1 w-full">
             <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Ajouté le {format(new Date(document.created_at), 'dd MMM yyyy', { locale: fr })}
             </div>
             <div className="flex items-center gap-1">
                <HardDrive className="h-4 w-4" />
                {document.is_external ? "Stockage Externe" : "Stockage Local"}
             </div>
          </div>
        </>
      }
      onEdit={onEdit ? () => onEdit(document) : undefined}
      footer={
        onDelete && (
          <Button
            variant="ghost"
            className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => onDelete(document)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer le document
          </Button>
        )
      }
    >
      {/* ACTIONS (Download/Link) */}
      <div className="mb-6">
        <Button
            variant="outline"
            className="w-full justify-start text-blue-400 hover:text-blue-300 border-blue-500/20 bg-blue-500/10"
            onClick={() => downloadDocument(document)}
            disabled={isDownloading}
        >
            {isDownloading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Téléchargement...
                </>
            ) : document.is_external ? (
                <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Ouvrir le lien
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le fichier
                </>
            )}
        </Button>
      </div>

      <Separator className="bg-white/10 mb-6" />

      {/* DESCRIPTION */}
      <div className="space-y-2">
         <h3 className="font-semibold text-white">Description / Notes</h3>
         <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed bg-[#0f1115] p-3 rounded-md border border-white/5">
            {document.description || "Aucune description fournie."}
         </div>
      </div>
    </EntityDetailsSheet>
  );
}

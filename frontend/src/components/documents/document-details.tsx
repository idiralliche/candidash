import {
  FileText,
  Calendar,
  Link as LinkIcon,
  Download,
  HardDrive,
  Loader2,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { Document } from '@/api/model';
import {
  LABELS_DOCUMENT_FORMAT,
  getLabel,
} from '@/lib/dictionaries';
import { getFormatPalette } from '@/lib/semantic-ui';
import { useDownloadDocument } from '@/hooks/use-download-document';
import { EntityDetailsSheet } from '@/components/shared/entity-details-sheet';
import { DetailsBlock } from '@/components/shared/details-block';

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
      badge={
        <Badge
          variant="subtle"
          palette={getFormatPalette(document.format)}
          className="mb-2"
        >
          {getLabel(LABELS_DOCUMENT_FORMAT, document.format)}
        </Badge>
      }
      metadata={
        <>
          <div className="flex items-center gap-2 rounded border border-white-light bg-white-subtle px-3 py-1.5 text-primary font-bold mb-2">
            <FileText className="h-4 w-4" />
            {document.type}
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
            palette="destructive"
            className="w-full"
            onClick={() => onDelete(document)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer le document
          </Button>
        )
      }
    >
      {/* PRIMARY ACTION */}
      <div className="mb-6">
        <Button
            variant="outline"
            palette="blue"
            className="w-full justify-start h-auto"
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
                    <div className="flex flex-col items-start text-left">
                        <span>Ouvrir le lien</span>
                    </div>
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" />
                    <div className="flex flex-col items-start text-left">
                        <span>Télécharger le fichier</span>
                    </div>
                </>
            )}
        </Button>
      </div>

      {/* DESCRIPTION */}
      {document.description && (
        <>
          <Separator className="bg-white-light mb-6" />

          <DetailsBlock icon={FileText} label="Description / Notes">
            <div className="whitespace-pre-wrap leading-relaxed">
                {document.description}
            </div>
          </DetailsBlock>
        </>
      )}
    </EntityDetailsSheet>
  );
}

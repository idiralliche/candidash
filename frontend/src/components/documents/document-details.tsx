import {
  FileText, Calendar, Link as LinkIcon, Trash2, Loader2, Pencil, Download, HardDrive
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Document } from '@/api/model';
import { LABELS_DOCUMENT_FORMAT, getLabel } from '@/lib/dictionaries';
import { getFormatBadgeVariant } from '@/lib/assign-colors'
import { useDeleteDocument } from '@/hooks/use-delete-document';
import { useDownloadDocument } from '@/hooks/use-download-document';

interface DocumentDetailsProps {
  document: Document;
  onClose?: () => void;
  onEdit?: (document: Document) => void;
}

export function DocumentDetails({ document, onClose, onEdit }: DocumentDetailsProps) {
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();
  const { downloadDocument, isDownloading } = useDownloadDocument();

  const handleDelete = () => {
    deleteDocument({ documentId: document.id }, {
      onSuccess: () => {
        if (onClose) onClose();
      }
    });
  };

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6 pb-10">

        {/* HEADER */}
        <div className="space-y-2">
          {/* Badge Format */}
          <Badge variant="outline" className={`${getFormatBadgeVariant(document.format)}`}>
            {getLabel(LABELS_DOCUMENT_FORMAT, document.format)}
          </Badge>

          {/* Title + Edit Button Row */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-bold text-white leading-tight break-all">
              {document.name}
            </h2>

            {/* EDIT BUTTON */}
            {onEdit && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0"
                onClick={() => onEdit(document)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 text-primary font-medium capitalize">
            <FileText className="h-5 w-5" />
            <span className="text-lg">{document.type}</span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-1">
             <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Ajouté le {format(new Date(document.created_at), 'dd MMM yyyy', { locale: fr })}
             </div>
             <div className="flex items-center gap-1">
                <HardDrive className="h-4 w-4" />
                {document.is_external ? "Stockage Externe" : "Stockage Local"}
             </div>
          </div>
        </div>

        {/* ACTIONS */}
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

        <Separator className="bg-white/10" />

        {/* DESCRIPTION */}
        <div className="space-y-6">
          <div className="space-y-2">
             <h3 className="font-semibold text-white">Description / Notes</h3>
             <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed bg-[#0f1115] p-3 rounded-md border border-white/5">
                {document.description || "Aucune description fournie."}
             </div>
          </div>
        </div>

        {/* DELETE ACTION */}
        <div className="pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer le document
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#16181d] border-white/10 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Cette action est irréversible. Le document
                  <span className="font-bold text-white"> {document.name} </span>
                  sera supprimé définitivement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-gray-300">
                  Annuler
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

      </div>
    </ScrollArea>
  );
}

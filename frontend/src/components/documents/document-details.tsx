import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  FileText,
  Calendar,
  Link as LinkIcon,
  Download,
  HardDrive,
  Loader2,
} from 'lucide-react';

import {
  LABELS_DOCUMENT_FORMAT,
  getLabel,
} from '@/lib/dictionaries';
import { getFormatPalette } from '@/lib/semantic-ui';

import { Document } from '@/api/model';
import { useDownloadDocument } from '@/hooks/documents/use-download-document';

import { Badge } from '@/components/ui/badge';
import { DocumentDetailsContent } from "@/components/documents/document-details-content";
import { EntityDetailsSheet } from '@/components/shared/entity-details-sheet';
import {
  DetailsMetaInfoBlock,
  DetailsMetaLinkButton,
  DetailsMetaInfoRowContainer,
} from "@/components/shared/details-meta-info-block";

interface DocumentDetailsProps {
  document: Document;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export function DocumentDetails({
  document,
  onEdit,
  onDelete,
}: DocumentDetailsProps) {
  const { downloadDocument, isDownloading } = useDownloadDocument();

  return (
    <EntityDetailsSheet
      entityName="document"
      onDelete={() => onDelete(document)}
    >
      <EntityDetailsSheet.Header>
        <EntityDetailsSheet.Badges>
          <Badge
            variant="subtle"
            palette={getFormatPalette(document.format)}
          >
            {getLabel(LABELS_DOCUMENT_FORMAT, document.format)}
          </Badge>
        </EntityDetailsSheet.Badges>

        <EntityDetailsSheet.TitleRow
          title={document.name}
          onEdit={() => onEdit(document)}
        />

        <EntityDetailsSheet.Metadata>

          <DetailsMetaInfoBlock
            icon={FileText}
            variant="squareBadge"
            label={document.type}
            firstLetterCase="upperCase"
          />

          <DetailsMetaInfoRowContainer>
            <DetailsMetaInfoBlock
              icon={Calendar}
              label={`Ajouté le ${format(document.created_at, 'dd MMMM yyyy', { locale: fr })}`}
            />

            <DetailsMetaInfoBlock
              icon={HardDrive}
              label={document.is_external ? "Stockage Externe" : "Stockage Local"}
            />
          </DetailsMetaInfoRowContainer>

          <DetailsMetaLinkButton
            icon={
              isDownloading ?
                Loader2 : document.is_external ?
                  LinkIcon : Download
            }
            label={
              isDownloading ?
                "Téléchargement..." : document.is_external ?
                  "Ouvrir le lien" : "Télécharger le fichier"
            }
            onClick={() => downloadDocument(document)}
            isLoading={isDownloading}
          />

        </EntityDetailsSheet.Metadata>
      </EntityDetailsSheet.Header>

      <DocumentDetailsContent document={document}/>
    </EntityDetailsSheet>
  );
}

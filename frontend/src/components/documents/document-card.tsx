import { ReactNode } from 'react';
import {
  FileText,
  File,
  Link as LinkIcon,
  Download,
  CalendarClock,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EntityCard } from '@/components/shared/entity-card';
import { CardInfoBlock } from '@/components/shared/card-info-block';

import { Document } from '@/api/model';
import {
  LABELS_DOCUMENT_FORMAT,
  getLabel,
} from '@/lib/dictionaries';
import { getFormatPalette } from '@/lib/semantic-ui';
import { useDownloadDocument } from '@/hooks/documents/use-download-document';

interface DocumentCardProps {
  document: Document;
  onClick?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  variant?: "default" | "compact" | "minimal";
  isHighlighted?: boolean;
  badges?: ReactNode;
  extraActions?: ReactNode;
}

export function DocumentCard({
  document,
  onClick,
  onEdit,
  onDelete,
  variant ="default",
  isHighlighted = false,
  badges,
  extraActions,
}: DocumentCardProps) {
  const { downloadDocument, isDownloading } = useDownloadDocument();
  const palette = getFormatPalette(document.format);

  const getIcon = () => {
    if (document.is_external) return <LinkIcon className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadDocument(document);
  };

  const isCompact = variant === 'compact';
  const isMinimal = variant === 'minimal';

  return (
    <EntityCard
      onClick={onClick && (() => onClick(document))}
      isHighlighted={isHighlighted}
      isMinimal={isMinimal}
    >

      {/* IDENTITY ZONE */}
      <EntityCard.Identity
        iconBoxProps={{ palette: palette }} //  isHighlighted -> palette: "blue"!
        icon={getIcon()}
      >
        <EntityCard.Info
          title={document.name}
          subtitle={
            <CardInfoBlock icon={File}>
              {document.type}
            </CardInfoBlock>
          }
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Meta>
        <div className="flex justify-start min-w-0">
          <Badge
            variant="subtle"
            palette={palette}
            className="text-[10px]"
          >
            {getLabel(LABELS_DOCUMENT_FORMAT, document.format)}
          </Badge>
        </div>

        <div className="flex justify-start lg:justify-center">
          {badges}
        </div>

        <div className="flex justify-start lg:justify-end">
          {!isCompact && (
            <CardInfoBlock icon={CalendarClock}>
              {format(new Date(document.created_at), 'dd MMM yyyy', { locale: fr })}
            </CardInfoBlock>
          )}
        </div>
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(document))}
        onDelete={onDelete && (() => onDelete(document))}
      >
        {/* Quick Download Button */}
        {!isCompact && (
          <Button
            variant="ghost"
            palette="gray"
            size="icon"
            className="hidden md:flex"
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
        )}
        {extraActions}
      </EntityCard.Actions>

    </EntityCard>
  );
}

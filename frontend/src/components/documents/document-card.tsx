import { ReactNode } from 'react';
import {
  FileText,
  Link as LinkIcon,
  Download,
  Calendar,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconBox } from '@/components/ui/icon-box';
import { EntityCard } from '@/components/shared/entity-card';

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
  variant?: "default" | "compact";
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

  return (
    <EntityCard
      onClick={onClick && (() => onClick(document))}
      hoverPalette={isHighlighted ? "blue" : "primary"}
      className={onClick ? "cursor-pointer" : "cursor-default"}
    >

      {/* IDENTITY ZONE */}
      <EntityCard.Identity>
        <IconBox
          palette={palette}
          groupHover
        >
          {getIcon()}
        </IconBox>

        <EntityCard.Info
          title={document.name}
          subtitle={
            <p className="text-xs text-gray-400 truncate capitalize">
              {document.type}
            </p>
          }
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      <EntityCard.Meta>
        <div className="flex justify-start min-w-0">
          <Badge
            variant="subtle"
            palette={palette}
            className="text-[10px] px-2 py-0.5 h-5"
          >
            {getLabel(LABELS_DOCUMENT_FORMAT, document.format)}
          </Badge>
        </div>

        <div className="flex justify-start lg:justify-center">
          {badges}
        </div>

        <div className="flex justify-start lg:justify-end">
          {!isCompact && (
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span>
                {format(new Date(document.created_at), 'dd MMM yyyy', { locale: fr })}
              </span>
            </div>
          )}
        </div>
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
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

import { FileText } from 'lucide-react';
import { Document } from '@/api/model';
import { DetailsBlock } from '@/components/shared/details-block';

export function DocumentDetailsContent({ document }: { document: Document; }) {

  return (document.description && (
    <DetailsBlock
      icon={FileText}
      label="Description / Notes"
    >
      {document.description}
    </DetailsBlock>
  ));
}

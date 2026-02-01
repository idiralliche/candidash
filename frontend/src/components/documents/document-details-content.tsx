import { FileText } from 'lucide-react';
import { Document } from '@/api/model';
import { DetailsBlock } from '@/components/shared/details-block';
import { BasicDetails } from '@/components/shared/basic-details';

export function DocumentDetailsContent({ document }: { document: Document; }) {

  return (document.description && (
      <DetailsBlock
        icon={FileText}
        label="Description / Notes"
      >
        <BasicDetails>
          {document.description}
        </BasicDetails>
      </DetailsBlock>
  ));
}

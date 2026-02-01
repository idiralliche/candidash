import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { DetailsBlock } from "@/components/shared/details-block";
import { LucideIcon } from "lucide-react";

interface EntityDetailsAssociationBlockProps<T> {
  data?: T[];
  label: string;
  isLoading: boolean;
  renderItem: (item: T) => React.ReactNode;
  icon: LucideIcon
  emptyMessage?: string;
}

export function EntityDetailsAssociationBlock<T>({
  isLoading,
  label,
  emptyMessage,
  data,
  renderItem,
  icon: Icon,
}: EntityDetailsAssociationBlockProps<T>) {
  const noData = !data || data.length === 0;

  if (isLoading) return (<CardListSkeleton count={1} cardHeight="h-[60px]" />);

  if (noData) {
    return (emptyMessage ?
      (<p className="text-sm text-muted-foreground italic">{emptyMessage}</p>) :
      null
    );
  }

  return (
    <DetailsBlock
      icon={Icon}
      label={label}
      variant="list"
    >
      {data.map(item => renderItem(item))}
    </DetailsBlock>
  )
}

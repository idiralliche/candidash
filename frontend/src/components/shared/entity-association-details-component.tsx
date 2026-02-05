import { ReactNode } from "react";
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { DetailsBlock, DetailsBlockTitleProps, DetailsBlockTitle } from "@/components/shared/details-block";
import { EntityDialog } from "@/components/shared/entity-dialog";

type EntityAssociationComponentRenderType<T> = {
  data?: T[];
  isLoading: boolean;
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
  onFormsOpen?: (close: () => void) => void;
}

type EntityAssociationComponentProps<T> =
  EntityAssociationComponentRenderType<T> & DetailsBlockTitleProps;

function checkData<T>(data: T[] | undefined): data is T[] {
  return data !== undefined && data.length > 0;
}

export function EntityAssociationDetailsComponent<T>(props: EntityAssociationComponentProps<T>) {
  const noData = !checkData(props.data);
  if(!props.action && noData && !props.emptyMessage) return null;
  const { ...renderProps } = props as EntityAssociationComponentRenderType<T>;
  const { ...detailsBLockProps } = props as DetailsBlockTitleProps;

  return (
    <DetailsBlock
      {...detailsBLockProps}
      variant="list"
    >
      <EntityAssociationComponentRender {...renderProps}/>
    </DetailsBlock>
  )
}

interface EntityAssociationCardComponentProps {
  trigger?: ReactNode;
  description?: string;
  className?: string;
  open?: boolean;
  openChange?: (open: boolean) => void;
  onFormsOpen: (close: () => void) => void;
}

export function EntityAssociationCardComponent<T>({
  data,
  action,
  emptyMessage,
  isLoading=false,
  renderItem,
  label,
  icon,
  description,
  className,
  open,
  openChange,
  trigger,
  onFormsOpen,
}: EntityAssociationComponentProps<T> & EntityAssociationCardComponentProps) {
  const noData = !checkData(data);
  if(!action && noData && !emptyMessage) return null;

  const title = (
    <div className="flex items-center justify-between mb-2">
      <DetailsBlockTitle
        {...{
          label,
          action,
          icon,
        }}
      />
    </div>
  );

  return (
    <EntityDialog
      trigger={trigger}
      open={open}
      onOpenChange={openChange}
      title={title}
      description={description}
      className={className}
      onFormsOpen={onFormsOpen}
    >
      <EntityAssociationComponentRender
        {...{
          isLoading,
          emptyMessage,
          data,
          renderItem
        }}
      />
    </EntityDialog>
  )
}

function EntityAssociationComponentRender<T> ({
  isLoading,
  emptyMessage,
  data,
  renderItem,
} : EntityAssociationComponentRenderType<T>) {
  const noData = !checkData(data);
  return (
    isLoading ? (
        <CardListSkeleton count={1} cardHeight="h-[60px]" />
      ) : noData ? (
        emptyMessage && (
          <p className="rounded-md border px-4 py-2 text-sm text-muted-foreground italic text-center border-dashed border-white-subtle">
            {emptyMessage}
          </p>
        )
      ) : (
        data.map(assoc => renderItem(assoc))
      )
  )
}



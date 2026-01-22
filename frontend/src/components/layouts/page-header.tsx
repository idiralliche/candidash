import { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PageHeaderProps {
  title: string;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
  tabs?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}

export function PageHeader({
  title,
  search,
  tabs,
  action,
  secondaryAction,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 w-full lg:flex-row lg:items-center lg:justify-between">
      <h1 className="text-2xl font-bold text-white md:text-3xl truncate order-first">
        {title}
      </h1>

      {search && (
        <div className="w-full lg:w-64 order-2">
          <Input
            placeholder={search.placeholder}
            leadingIcon={Search}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
          />
        </div>
      )}

      {(tabs || action || secondaryAction) && (
        <div className="flex items-center justify-between gap-3 text-sm text-gray-400 min-w-0 order-last">

          <div className="flex justify-start min-w-0 items-center gap-2">
            {tabs}
            {secondaryAction}
          </div>

          <div className="flex justify-end min-w-0 items-center gap-2">
            {action}
          </div>

        </div>
      )}


    </div>
  );
}

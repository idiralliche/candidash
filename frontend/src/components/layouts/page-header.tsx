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
}

export function PageHeader({ title, search, tabs, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-3xl font-bold text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search Bar */}
        {search && (
          <div className="w-64">
            <Input
              placeholder={search.placeholder}
              leadingIcon={Search}
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
            />
          </div>
        )}

        {/* Tabs */}
        {tabs}

        {/* Action Button */}
        {action}
      </div>
    </div>
  );
}

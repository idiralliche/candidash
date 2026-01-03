import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LucideIcon } from 'lucide-react';

interface ViewTab {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface ViewTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: ViewTab[];
}

export function ViewTabs({ value, onValueChange, tabs }: ViewTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className="bg-surface-base border border-white-light">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

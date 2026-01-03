import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Layout Components
import { PageLayout } from '@/components/layouts/page-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { PageContent } from '@/components/layouts/page-content';

export function DashboardPage() {
  return (
    <PageLayout>
      <PageHeader title="Tableau de bord" />

      <PageContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-white-light bg-surface-modal">
            <CardHeader>
              <CardTitle className="text-white">Candidatures en cours</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">0</p>
            </CardContent>
          </Card>

          <Card className="border-white-light bg-surface-modal">
            <CardHeader>
              <CardTitle className="text-white">Entretiens prévus</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">0</p>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageLayout>
  );
}

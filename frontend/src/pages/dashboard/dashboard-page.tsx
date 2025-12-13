import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardPage() {
  return (
    <div className="space-y-8 pt-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-white/10 bg-[#13151a]">
          <CardHeader>
            <CardTitle className="text-white">Candidatures en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">0</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#13151a]">
          <CardHeader>
            <CardTitle className="text-white">Entretiens prévus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

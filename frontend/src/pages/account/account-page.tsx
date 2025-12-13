import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AccountPage() {
  return (
    <div className="space-y-8 pt-20">
      <h1 className="text-3xl font-bold text-white">Mon compte</h1>
      <Card className="border-white/10 bg-[#13151a]">
        <CardHeader>
          <CardTitle className="text-white">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Fonctionnalité à venir...</p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardPage() {
  const { user, isLoading } = useUserProfile();

  return (
    <div className="space-y-8 pt-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-10 w-64 bg-white/10" />
          ) : (
            <span>{user?.first_name} {user?.last_name} : Tableau de bord</span>
          )}
        </h1>
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

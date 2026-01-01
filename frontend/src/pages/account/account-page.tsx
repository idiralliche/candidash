import { User, Mail, Calendar, Lock, LogOut, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useAuth } from '@/hooks/use-auth';

export function AccountPage() {
  const { user, isLoading } = useUserProfile();
  const { logout } = useAuth();

  return (
    <div className="space-y-8 pt-20">
      <h1 className="text-3xl font-bold text-white">Mon compte</h1>

      <Card className="max-w-2xl border-white-light bg-[#13151a]">
        <CardHeader>
          <CardTitle className="text-white">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Bloc Informations */}
          <div className="space-y-6">

            {/* Ligne Identité (Prénom + Nom) */}
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white-subtle ">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-400">Identité</span>
                {isLoading ? (
                  <Skeleton className="h-6 w-48 bg-white-subtle  mt-1" />
                ) : (
                  <span className="text-lg font-medium text-white">
                    {user?.first_name} {user?.last_name}
                  </span>
                )}
              </div>
            </div>

            {/* Ligne Email */}
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white-subtle ">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-400">Email</span>
                {isLoading ? (
                  <Skeleton className="h-6 w-64 bg-white-subtle  mt-1" />
                ) : (
                  <span className="text-lg font-medium text-white">
                    {user?.email}
                  </span>
                )}
              </div>
            </div>

            {/* Ligne Date d'inscription */}
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white-subtle ">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-400">Membre depuis le</span>
                {isLoading ? (
                  <Skeleton className="h-6 w-32 bg-white-subtle  mt-1" />
                ) : (
                  <span className="text-lg font-medium text-white">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </span>
                )}
              </div>
            </div>

          </div>

          <Separator className="bg-white-light " />

          {/* Bloc Actions (Liens avec icônes, sans soulignage) */}
          <div className="flex flex-col items-start space-y-3">

            {/* Lien Changer mot de passe (Inactif) */}
            <Button
              variant="link"
              className="h-auto p-0 text-gray-400 hover:text-white hover:no-underline flex items-center gap-2"
              disabled
            >
              <Lock className="h-4 w-4" />
              Changer le mot de passe (Bientôt disponible)
            </Button>

            {/* Lien Se déconnecter (Actif) */}
            <Button
              variant="link"
              className="h-auto p-0 text-white hover:text-primary hover:no-underline flex items-center gap-2"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>

            {/* Lien Supprimer mon compte (Inactif - Rouge clair) */}
            <Button
              variant="link"
              className="h-auto p-0 text-red-400 hover:text-red-300 hover:no-underline flex items-center gap-2"
              disabled
            >
              <Trash2 className="h-4 w-4" />
              Supprimer mon compte
            </Button>

          </div>

        </CardContent>
      </Card>
    </div>
  );
}

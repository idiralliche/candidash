import { Link } from '@tanstack/react-router';
import {
  Loader2,
  Mail,
  Lock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SmartFormField } from '@/components/ui/form-field-wrapper';

import { useLoginPageLogic } from '@/hooks/authentication/use-login-page-logic';

export function LoginPage() {
  const logic = useLoginPageLogic();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-white-light bg-surface-base shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Connexion</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Entrez vos identifiants pour accéder à votre espace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...logic.form}>
            <form onSubmit={logic.form.handleSubmit(logic.onSubmit)} className="space-y-4">

              <SmartFormField
                control={logic.form.control}
                name="username"
                label="Email"
                component={Input}
                placeholder="exemple@email.com"
                leadingIcon={Mail}
              />

              <SmartFormField
                control={logic.form.control}
                name="password"
                label="Mot de passe"
                component={Input}
                type="password"
                placeholder="••••••••"
                leadingIcon={Lock}
              />

              {logic.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center animate-in fade-in slide-in-from-top-1">
                  Identifiants incorrects. Veuillez réessayer.
                </div>
              )}

              <Button
                type="submit"
                variant="solid"
                palette="primary"
                className="w-full"
                disabled={logic.isPending}
              >
                {logic.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-center text-sm text-gray-500">
            Pas encore de compte ?{" "}
            <Link to="/" className="text-primary hover:text-primary-light hover:underline transition-colors">
              S'inscrire
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

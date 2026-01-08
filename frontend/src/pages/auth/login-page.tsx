import { useEffect } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Mail,
  Lock,
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

// API & Context
import { useLoginApiV1AuthLoginPost } from '@/api/authentication/authentication';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  username: z.string().email({ message: "Email invalide" }),
  password: z.string().min(1, { message: "Mot de passe requis" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, navigate]);

  const { mutate: submitLogin, isPending, error } = useLoginApiV1AuthLoginPost({
    mutation: {
      onSuccess: (data) => {
        authLogin(data.access_token);
        // Navigation will happen automatically via useEffect above
      },
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  function onSubmit(values: LoginFormValues) {
    submitLogin({
      data: {
        username: values.username,
        password: values.password
      }
    });
  }

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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <SmartFormField
                control={form.control}
                name="username"
                label="Email"
                component={Input}
                placeholder="exemple@email.com"
                leadingIcon={Mail}
              />

              <SmartFormField
                control={form.control}
                name="password"
                label="Mot de passe"
                component={Input}
                type="password"
                placeholder="••••••••"
                leadingIcon={Lock}
              />

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center animate-in fade-in slide-in-from-top-1">
                  Identifiants incorrects. Veuillez réessayer.
                </div>
              )}

              <Button
                type="submit"
                variant="solid"
                palette="primary"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? (
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

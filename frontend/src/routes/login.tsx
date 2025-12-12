import { createRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useLoginApiV1AuthLoginPost } from '@/api/authentication/authentication';
import { rootRoute } from './__root';

const loginSchema = z.object({
  username: z.string().email({ message: "Email invalide" }),
  password: z.string().min(1, { message: "Mot de passe requis" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const { mutate: login, isPending, error } = useLoginApiV1AuthLoginPost({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem('token', data.access_token);
        navigate({ to: '/' });
      },
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(values: LoginFormValues) {
    login({
      data: {
        username: values.username,
        password: values.password,
      }
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-white/10 bg-[#13151a] shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Connexion</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Entrez vos identifiants pour accéder à votre espace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="exemple@email.com"
                        {...field}
                        className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
                  Identifiants incorrects. Veuillez réessayer.
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-white hover:bg-[#e84232]"
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
            <Link to="/" className="text-primary hover:underline">
              S'inscrire
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

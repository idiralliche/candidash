import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Mail,
  Lock,
  User,
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

import { useRegisterApiV1AuthRegisterPost } from '@/api/authentication/authentication';

const registerSchema = z.object({
  first_name: z.string().min(2, { message: "Minimum 2 caractères" }),
  last_name: z.string().min(2, { message: "Minimum 2 caractères" }),
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(8, { message: "Le mot de passe doit faire au moins 8 caractères" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();

  const { mutate: register, isPending, error } = useRegisterApiV1AuthRegisterPost({
    mutation: {
      onSuccess: () => {
        navigate({ to: '/login' });
      },
    },
  });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  function onSubmit(values: RegisterFormValues) {
    register({
      data: {
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        confirm_password: values.confirmPassword,
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-white-light bg-surface-base shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">Créer un compte</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Rejoignez CandiDash pour gérer vos candidatures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <SmartFormField
                  control={form.control}
                  name="first_name"
                  label="Prénom"
                  component={Input}
                  placeholder="Jean"
                  leadingIcon={User}
                />
                <SmartFormField
                  control={form.control}
                  name="last_name"
                  label="Nom"
                  component={Input}
                  placeholder="Dupont"
                  leadingIcon={User}
                />
              </div>

              <SmartFormField
                control={form.control}
                name="email"
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

              <SmartFormField
                control={form.control}
                name="confirmPassword"
                label="Confirmer le mot de passe"
                component={Input}
                type="password"
                placeholder="••••••••"
                leadingIcon={Lock}
              />

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center animate-in fade-in slide-in-from-top-1">
                  Une erreur est survenue (l'email existe peut-être déjà).
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
                    Création...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-center text-sm text-gray-500">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary hover:text-primary-light hover:underline transition-colors">
              Se connecter
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

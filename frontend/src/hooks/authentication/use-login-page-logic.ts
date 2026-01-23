import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useLoginApiV1AuthLoginPost } from '@/api/authentication/authentication';
import { useAuth } from '@/hooks/shared/use-auth';

// --- SCHEMA & TYPES ---
const loginSchema = z.object({
  username: z.string().email({ message: "Email invalide" }),
  password: z.string().min(1, { message: "Mot de passe requis" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function useLoginPageLogic() {
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
        // Navigation handled by useEffect
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

  return {
    form,
    onSubmit,
    isPending,
    error,
  };
}

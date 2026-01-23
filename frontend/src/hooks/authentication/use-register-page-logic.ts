import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useRegisterApiV1AuthRegisterPost } from '@/api/authentication/authentication';

// --- SCHEMA ---
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

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function useRegisterPageLogic() {
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

  return {
    form,
    onSubmit,
    isPending,
    error,
  };
}

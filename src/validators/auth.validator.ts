import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Le prénom est trop long'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Le nom est trop long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateUserSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  email: z.string().email('Format d\'email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Le prénom est trop long'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Le nom est trop long'),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

import { z } from 'zod';

// SHA-256 hash validation: 64 hexadecimal characters
const sha256HashSchema = z
  .string()
  .length(64, 'Le mot de passe doit être hashé (SHA-256)')
  .regex(/^[a-f0-9]+$/, 'Format de hash invalide');

export const registerSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: sha256HashSchema,
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
  password: sha256HashSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateUserSchema = z.object({
  currentPassword: sha256HashSchema,
  email: z.string().email('Format d\'email invalide'),
  password: sha256HashSchema.optional(),
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

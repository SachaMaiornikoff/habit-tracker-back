import { z } from 'zod';

export const createHabitSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  color: z
    .string()
    .min(1, 'La couleur est requise')
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      'La couleur doit être au format hexadécimal (#RRGGBB)'
    ),
  weeklyTarget: z
    .number()
    .int('La cible hebdomadaire doit être un entier')
    .min(1, 'La cible hebdomadaire doit être au moins 1')
    .max(7, 'La cible hebdomadaire ne peut pas dépasser 7')
    .optional()
    .default(1),
});

export const updateHabitSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .optional(),
  color: z
    .string()
    .min(1, 'La couleur est requise')
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      'La couleur doit être au format hexadécimal (#RRGGBB)'
    )
    .optional(),
  weeklyTarget: z
    .number()
    .int('La cible hebdomadaire doit être un entier')
    .min(1, 'La cible hebdomadaire doit être au moins 1')
    .max(7, 'La cible hebdomadaire ne peut pas dépasser 7')
    .optional(),
  archivedAt: z
    .string()
    .datetime("La date d'archivage doit être au format ISO 8601")
    .nullable()
    .optional(),
});

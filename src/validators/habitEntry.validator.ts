import { z } from 'zod';

export const getHabitEntriesSchema = z.object({
  habitId: z.string().uuid('habitId doit être un UUID valide'),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate doit être au format YYYY-MM-DD'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate doit être au format YYYY-MM-DD'),
});

export const upsertHabitEntrySchema = z.object({
  habitId: z.string().uuid('habitId doit être un UUID valide'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date doit être au format YYYY-MM-DD'),
  completed: z.boolean(),
});

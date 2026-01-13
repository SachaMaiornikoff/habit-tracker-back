import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import {
  getHabitEntriesSchema,
  upsertHabitEntrySchema,
} from '../validators/habitEntry.validator';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ValidationError, NotFoundError } from '../errors/AppError';

export async function getHabitEntries(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user: authUser } = req as AuthenticatedRequest;

    const validation = getHabitEntriesSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError(
        'Echec de la validation',
        validation.error.issues
      );
    }

    const { habitId, startDate, endDate } = validation.data;

    // Vérifier que l'habit appartient à l'utilisateur
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: authUser.userId,
      },
    });

    if (!habit) {
      throw new NotFoundError('Habitude non trouvée');
    }

    const entries = await prisma.habitEntry.findMany({
      where: {
        habitId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    res.json({
      success: true,
      data: { entries },
    });
  } catch (error) {
    next(error);
  }
}

export async function upsertHabitEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user: authUser } = req as AuthenticatedRequest;

    const validation = upsertHabitEntrySchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        'Echec de la validation',
        validation.error.issues
      );
    }

    const { habitId, date, completed } = validation.data;

    // Vérifier que l'habit appartient à l'utilisateur
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: authUser.userId,
      },
    });

    if (!habit) {
      throw new NotFoundError('Habitude non trouvée');
    }

    if (completed) {
      // L'entrée doit exister en base : on la crée si elle n'existe pas
      await prisma.habitEntry.upsert({
        where: {
          habitId_date: {
            habitId,
            date,
          },
        },
        update: {}, // Ne rien faire si elle existe déjà
        create: {
          habitId,
          date,
        },
      });
    } else {
      // L'entrée ne doit pas exister en base : on la supprime si elle existe
      await prisma.habitEntry.deleteMany({
        where: {
          habitId,
          date,
        },
      });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

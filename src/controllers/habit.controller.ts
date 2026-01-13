import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import {
  createHabitSchema,
  updateHabitSchema,
} from '../validators/habit.validator';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ValidationError, NotFoundError } from '../errors/AppError';

export async function createHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user: authUser } = req as AuthenticatedRequest;

    const validation = createHabitSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        'Echec de la validation',
        validation.error.issues
      );
    }

    const { title, color, weeklyTarget } = validation.data;

    const habit = await prisma.habit.create({
      data: {
        userId: authUser.userId,
        title,
        color,
        weeklyTarget,
      },
    });

    res.status(201).json({
      success: true,
      data: { habit },
    });
  } catch (error) {
    next(error);
  }
}

export async function getHabits(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user: authUser } = req as AuthenticatedRequest;

    const habits = await prisma.habit.findMany({
      where: {
        userId: authUser.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { habits },
    });
  } catch (error) {
    next(error);
  }
}

export async function getHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user: authUser } = req as AuthenticatedRequest;
    const { id } = req.params;

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: authUser.userId,
      },
    });

    if (!habit) {
      throw new NotFoundError('Habitude non trouvée');
    }

    res.json({
      success: true,
      data: { habit },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user: authUser } = req as AuthenticatedRequest;
    const { id } = req.params;

    const validation = updateHabitSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        'Echec de la validation',
        validation.error.issues
      );
    }

    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: authUser.userId,
      },
    });

    if (!existingHabit) {
      throw new NotFoundError('Habitude non trouvée');
    }

    const { title, color, weeklyTarget, archivedAt } = validation.data;

    const habit = await prisma.habit.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(color !== undefined && { color }),
        ...(weeklyTarget !== undefined && { weeklyTarget }),
        ...(archivedAt !== undefined && {
          archivedAt: archivedAt ? new Date(archivedAt) : null,
        }),
      },
    });

    res.json({
      success: true,
      data: { habit },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user: authUser } = req as AuthenticatedRequest;
    const { id } = req.params;

    const existingHabit = await prisma.habit.findFirst({
      where: {
        id,
        userId: authUser.userId,
      },
    });

    if (!existingHabit) {
      throw new NotFoundError('Habitude non trouvée');
    }

    // Supprimer d'abord les HabitEntry associées pour éviter les reliquats
    await prisma.habitEntry.deleteMany({
      where: { habitId: id },
    });

    await prisma.habit.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function getHabitStreak(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user: authUser } = req as AuthenticatedRequest;
    const { id } = req.params;

    const habit = await prisma.habit.findFirst({
      where: {
        id,
        userId: authUser.userId,
      },
    });

    if (!habit) {
      throw new NotFoundError('Habitude non trouvée');
    }

    const { weeklyTarget } = habit;

    // Obtenir le début de la semaine précédente
    const now = new Date();
    const startOfCurrentWeek = getStartOfWeek(now);
    const startOfPreviousWeek = new Date(startOfCurrentWeek);
    startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

    // Récupérer toutes les entrées de cette habitude
    const entries = await prisma.habitEntry.findMany({
      where: {
        habitId: id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Convertir les entrées en un Set de dates pour recherche rapide
    const entryDates = new Set(entries.map((e: { date: string }) => e.date));

    let streak = 0;
    const weekStart = new Date(startOfPreviousWeek);

    // Parcourir les semaines vers le passé
    while (true) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Compter les entrées dans cette semaine
      let countInWeek = 0;
      for (
        let d = new Date(weekStart);
        d <= weekEnd;
        d.setDate(d.getDate() + 1)
      ) {
        if (entryDates.has(formatDate(d))) {
          countInWeek++;
        }
      }

      // Si on n'atteint pas le target, la streak s'arrête
      if (countInWeek < weeklyTarget) {
        break;
      }

      streak++;

      // Passer à la semaine précédente
      weekStart.setDate(weekStart.getDate() - 7);
    }

    res.json({
      success: true,
      data: { streak },
    });
  } catch (error) {
    next(error);
  }
}

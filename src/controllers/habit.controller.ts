import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../generated/prisma/client';
import { createHabitSchema, updateHabitSchema } from '../validators/habit.validator';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import {
  ValidationError,
  NotFoundError,
} from '../errors/AppError';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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
        ...(archivedAt !== undefined && { archivedAt: archivedAt ? new Date(archivedAt) : null }),
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

    await prisma.habit.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

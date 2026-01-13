import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../generated/prisma/client';
import { registerSchema, loginSchema, updateUserSchema } from '../validators/auth.validator';
import {
  hashPassword,
  comparePassword,
  generateToken,
} from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../errors/AppError';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        'Echec de la validation',
        validation.error.issues
      );
    }

    const { email, password, firstName, lastName } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('Email deja enregistre');
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuthenticatedUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user: authUser } = req as AuthenticatedRequest;

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Utilisateur non trouve');
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        'Echec de la validation',
        validation.error.issues
      );
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Identifiants invalides');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Identifiants invalides');
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user: authUser } = req as AuthenticatedRequest;

    const validation = updateUserSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError(
        'Echec de la validation',
        validation.error.issues
      );
    }

    const { currentPassword, email, password, firstName, lastName } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
    });

    if (!user) {
      throw new NotFoundError('Utilisateur non trouve');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Mot de passe actuel incorrect');
    }

    if (email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictError('Cet email est deja utilise');
      }
    }

    const updateData: { email: string; firstName: string; lastName: string; passwordHash?: string } = {
      email,
      firstName,
      lastName,
    };

    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          createdAt: updatedUser.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

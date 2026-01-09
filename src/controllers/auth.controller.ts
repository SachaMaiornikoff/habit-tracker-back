import 'dotenv/config';
import { Request, Response } from 'express';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../generated/prisma/client';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { hashPassword, comparePassword, generateToken } from '../services/auth.service';

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new (PrismaClient as any)({ adapter });

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues,
      });
      return;
    }

    const { email, password, firstName, lastName } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        error: 'Email already registered',
      });
      return;
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
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.issues,
      });
      return;
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        error: 'Invalid credentials',
      });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        error: 'Invalid credentials',
      });
      return;
    }

    const token = generateToken(user.id);

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}

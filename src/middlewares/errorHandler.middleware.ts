import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Erreur non gérée
  const response: ErrorResponse = {
    success: false,
    error: {
      message: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR',
    },
  };
  res.status(500).json(response);
}

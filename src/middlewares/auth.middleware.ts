import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';
import { UnauthorizedError } from '../errors/AppError';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('En-tete Authorization manquant');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError(
        'Format d\'autorisation invalide. Utilisez: Bearer <token>'
      );
    }

    const token = parts[1];
    const payload = verifyToken(token);
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Token invalide ou expire'));
    }
  }
}

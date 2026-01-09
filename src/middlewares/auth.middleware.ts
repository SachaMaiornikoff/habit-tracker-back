import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service';

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    (req as AuthenticatedRequest).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

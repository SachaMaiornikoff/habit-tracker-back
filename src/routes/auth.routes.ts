import { Router } from 'express';
import { register, getAuthenticatedUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.get('/me', authMiddleware, getAuthenticatedUser);

export default router;

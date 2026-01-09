import { Router } from 'express';

import { register, login, getAuthenticatedUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.get('/me', authMiddleware, getAuthenticatedUser);
router.post('/login', login);

export default router;

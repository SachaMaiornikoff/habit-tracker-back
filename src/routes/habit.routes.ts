import { Router } from 'express';

import {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
} from '../controllers/habit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createHabit);
router.get('/', getHabits);
router.get('/:id', getHabit);
router.patch('/:id', updateHabit);
router.delete('/:id', deleteHabit);

export default router;

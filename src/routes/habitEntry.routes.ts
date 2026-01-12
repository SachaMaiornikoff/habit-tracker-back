import { Router } from 'express';

import {
  getHabitEntries,
  upsertHabitEntry,
} from '../controllers/habitEntry.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getHabitEntries);
router.put('/', upsertHabitEntry);

export default router;

import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

import * as aiController from '../controllers/ai.controller';

router.post('/chat', aiController.chat);
router.post('/suggest', aiController.suggest);

export default router;

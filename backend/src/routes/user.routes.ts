import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

import * as userController from '../controllers/user.controller';

router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);
router.get('/:id', userController.getUserById);

export default router;

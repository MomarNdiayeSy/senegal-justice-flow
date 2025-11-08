import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

import * as notificationController from '../controllers/notification.controller';

router.get('/', notificationController.listNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreferences);

export default router;

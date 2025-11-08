import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(authenticate, authorize('ADMIN'));

import * as adminController from '../controllers/admin.controller';

router.get('/users', adminController.listUsers);
router.put('/users/:id/role', adminController.changeUserRole);
router.get('/stats', adminController.getStats);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;

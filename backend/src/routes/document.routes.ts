import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

import * as documentController from '../controllers/document.controller';

// Public routes
router.get('/public', documentController.listPublicDocuments);
router.get('/:id', documentController.downloadDocument);

// Admin routes
router.post('/', authenticate, authorize('ADMIN'), documentController.uploadDocument);

export default router;

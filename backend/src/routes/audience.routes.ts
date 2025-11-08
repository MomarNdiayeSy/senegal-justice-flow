import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

import * as audienceController from '../controllers/audience.controller';

// Public route
router.get('/public', audienceController.getPublicAudiences);

// Protected routes
router.use(authenticate);

router.get('/', audienceController.listAudiences);
router.post('/', audienceController.createAudience);
router.get('/:id', audienceController.getAudienceById);
router.put('/:id', audienceController.updateAudience);
router.delete('/:id', audienceController.cancelAudience);

export default router;

import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', (req, res) => {
  res.json({ success: true, message: 'List notifications endpoint - TO IMPLEMENT' });
});

router.put('/:id/read', (req, res) => {
  res.json({ success: true, message: 'Mark as read endpoint - TO IMPLEMENT' });
});

router.get('/preferences', (req, res) => {
  res.json({ success: true, message: 'Get preferences endpoint - TO IMPLEMENT' });
});

router.put('/preferences', (req, res) => {
  res.json({ success: true, message: 'Update preferences endpoint - TO IMPLEMENT' });
});

export default router;

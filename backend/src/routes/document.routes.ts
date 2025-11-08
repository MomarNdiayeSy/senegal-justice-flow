import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/public', (req, res) => {
  res.json({ success: true, message: 'List public documents endpoint - TO IMPLEMENT' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Download document endpoint - TO IMPLEMENT' });
});

// Admin routes
router.post('/', authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Upload document endpoint - TO IMPLEMENT' });
});

export default router;

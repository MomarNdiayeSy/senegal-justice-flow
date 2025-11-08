import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'List blog posts endpoint - TO IMPLEMENT' });
});

router.get('/:slug', (req, res) => {
  res.json({ success: true, message: 'Get blog post endpoint - TO IMPLEMENT' });
});

// Admin routes
router.post('/', authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Create blog post endpoint - TO IMPLEMENT' });
});

router.put('/:id', authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Update blog post endpoint - TO IMPLEMENT' });
});

router.delete('/:id', authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Delete blog post endpoint - TO IMPLEMENT' });
});

export default router;

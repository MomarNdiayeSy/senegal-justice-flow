import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route
router.get('/public', (req, res) => {
  res.json({ success: true, message: 'Public audiences endpoint - TO IMPLEMENT' });
});

// Protected routes
router.use(authenticate);

router.get('/', (req, res) => {
  res.json({ success: true, message: 'List audiences endpoint - TO IMPLEMENT' });
});

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Create audience endpoint - TO IMPLEMENT' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get audience endpoint - TO IMPLEMENT' });
});

router.put('/:id', (req, res) => {
  res.json({ success: true, message: 'Update audience endpoint - TO IMPLEMENT' });
});

router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Cancel audience endpoint - TO IMPLEMENT' });
});

export default router;

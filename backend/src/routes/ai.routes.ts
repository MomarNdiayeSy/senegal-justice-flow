import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/chat', (req, res) => {
  res.json({ success: true, message: 'AI chat endpoint - TO IMPLEMENT' });
});

router.post('/suggest', (req, res) => {
  res.json({ success: true, message: 'AI suggestions endpoint - TO IMPLEMENT' });
});

export default router;

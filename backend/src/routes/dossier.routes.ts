import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', (req, res) => {
  res.json({ success: true, message: 'List dossiers endpoint - TO IMPLEMENT' });
});

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Create dossier endpoint - TO IMPLEMENT' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get dossier endpoint - TO IMPLEMENT' });
});

router.put('/:id', (req, res) => {
  res.json({ success: true, message: 'Update dossier endpoint - TO IMPLEMENT' });
});

router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Delete dossier endpoint - TO IMPLEMENT' });
});

export default router;

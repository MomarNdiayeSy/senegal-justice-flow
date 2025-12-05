import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as instructionController from '../controllers/instruction.controller';

const router = Router();

// List instructions
router.get('/', authenticate, instructionController.listInstructions);

// Get instruction by ID
router.get('/:id', authenticate, instructionController.getInstructionById);

// Create instruction (Judge only)
router.post(
  '/',
  authenticate,
  authorize('JUGE'),
  validate([
    body('type').trim().notEmpty(),
    body('titre').trim().notEmpty(),
    body('description').trim().notEmpty(),
  ]),
  instructionController.createInstruction
);

// Take instruction (Greffier)
router.post(
  '/:id/take',
  authenticate,
  authorize('GREFFIER'),
  validate([param('id').isUUID()]),
  instructionController.takeInstruction
);

// Complete instruction (Greffier)
router.post(
  '/:id/complete',
  authenticate,
  authorize('GREFFIER'),
  validate([param('id').isUUID()]),
  instructionController.completeInstruction
);

// Cancel instruction (Judge)
router.delete(
  '/:id',
  authenticate,
  authorize('JUGE', 'ADMIN'),
  validate([param('id').isUUID()]),
  instructionController.cancelInstruction
);

export default router;

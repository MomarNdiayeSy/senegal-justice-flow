import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import * as decisionController from '../controllers/decision.controller';

const router = Router();

// List decisions
router.get('/', authenticate, decisionController.listDecisions);

// Get decision by ID
router.get('/:id', authenticate, decisionController.getDecisionById);

// Create decision (Judge only)
router.post(
  '/',
  authenticate,
  authorize('JUGE'),
  validate([
    body('dossierId').isUUID(),
    body('numeroDecision').trim().notEmpty(),
    body('typeDecision').trim().notEmpty(),
    body('dateDelibere').isISO8601(),
    body('dispositif').trim().notEmpty(),
  ]),
  decisionController.createDecision
);

// Update decision
router.put(
  '/:id',
  authenticate,
  authorize('JUGE'),
  validate([param('id').isUUID()]),
  decisionController.updateDecision
);

// Submit for validation (Judge)
router.post(
  '/:id/submit',
  authenticate,
  authorize('JUGE'),
  validate([param('id').isUUID()]),
  decisionController.submitForValidation
);

// Validate decision (Greffier)
router.post(
  '/:id/validate',
  authenticate,
  authorize('GREFFIER', 'ADMIN'),
  validate([param('id').isUUID()]),
  decisionController.validateDecision
);

// Publish decision (Greffier)
router.post(
  '/:id/publish',
  authenticate,
  authorize('GREFFIER', 'ADMIN'),
  validate([param('id').isUUID()]),
  decisionController.publishDecision
);

export default router;

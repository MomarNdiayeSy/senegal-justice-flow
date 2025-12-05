import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

import * as userController from '../controllers/user.controller';

// Routes utilisateur connecté
router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);

// Routes gestion utilisateurs (Admin/Greffier)
router.get('/', userController.getAllUsers);
router.post('/', validate([
  body('email').isEmail().withMessage('Email invalide'),
  body('nom').trim().notEmpty().withMessage('Nom requis'),
  body('prenom').trim().notEmpty().withMessage('Prénom requis'),
  body('role').isIn(['ADMIN', 'GREFFIER', 'JUGE', 'PROCUREUR', 'AVOCAT', 'JUSTICIABLE']).withMessage('Rôle invalide'),
]), userController.createUser);

router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUser);

// Activation/Désactivation de compte
router.post('/:id/activate', userController.activateUser);
router.post('/:id/deactivate', userController.deactivateUser);

export default router;

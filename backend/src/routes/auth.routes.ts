import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import * as authController from '../controllers/auth.controller';

const router = Router();

// Validation schemas
const registerValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  body('nom').trim().notEmpty().withMessage('Le nom est requis'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est requis'),
  body('telephone').optional().isMobilePhone('any'),
  body('role').isIn(['GREFFIER', 'JUGE', 'PROCUREUR', 'AVOCAT', 'JUSTICIABLE']).withMessage('Rôle invalide (Admin non autorisé)'),
  body('tribunal').optional().trim(),
];

const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

// Routes
router.post(
  '/register',
  authLimiter,
  validate(registerValidation),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginValidation),
  authController.login
);

router.post('/logout', authController.logout);

router.post('/refresh-token', authController.refreshToken);

router.post(
  '/forgot-password',
  authLimiter,
  validate([body('email').isEmail()]),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validate([
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ]),
  authController.resetPassword
);

export default router;

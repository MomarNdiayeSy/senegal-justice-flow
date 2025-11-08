import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
  skipSuccessfulRequests: true,
});

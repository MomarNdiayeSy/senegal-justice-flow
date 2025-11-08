import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Token d\'authentification manquant');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Token invalide'));
    } else if (error instanceof Error && error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expiré'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Non authentifié'));
    }

    const hasRole = roles.some(role => req.user!.roles.includes(role));

    if (!hasRole) {
      return next(
        new ApiError(403, 'Accès refusé : permissions insuffisantes')
      );
    }

    next();
  };
};

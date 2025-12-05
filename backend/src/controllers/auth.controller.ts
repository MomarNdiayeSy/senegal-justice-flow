import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  const { email, password, nom, prenom, telephone, role, tribunal } = req.body;

  // Vérifier que le rôle n'est pas ADMIN (inscription admin interdite)
  if (role === 'ADMIN') {
    throw new ApiError(403, 'Inscription en tant qu\'administrateur non autorisée');
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, 'Un utilisateur avec cet email existe déjà');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

  // Déterminer si le compte doit être activé automatiquement
  // Seuls les comptes créés par un admin/greffier sont actifs immédiatement
  const isActive = false; // Les inscriptions publiques nécessitent activation par greffier

  // Create user with profile and role in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        isActive,
        profile: {
          create: {
            nom,
            prenom,
            telephone,
            tribunalAttache: tribunal || null,
          },
        },
        roles: {
          create: {
            role,
          },
        },
      },
      include: {
        profile: true,
        roles: true,
      },
    });

    return newUser;
  });

  logger.info(`New user registered (pending activation): ${email}`);

  res.status(201).json({
    success: true,
    message: 'Inscription enregistrée. Votre compte sera activé par le greffier après vérification.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        roles: user.roles.map((r) => r.role),
        isActive: user.isActive,
      },
      // Ne pas générer de tokens si le compte n'est pas actif
      accessToken: null,
      refreshToken: null,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      roles: true,
    },
  });

  if (!user) {
    throw new ApiError(401, 'Email ou mot de passe incorrect');
  }

  // Vérifier si le compte est actif
  if (!user.isActive) {
    throw new ApiError(403, 'Votre compte n\'est pas encore activé. Veuillez attendre la validation par le greffier.');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Email ou mot de passe incorrect');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  logger.info(`User logged in: ${email}`);

  // Generate tokens
  const roles = user.roles.map((r) => r.role);
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    roles,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    roles,
  });

  res.json({
    success: true,
    message: 'Connexion réussie',
    data: {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        roles,
        isActive: user.isActive,
      },
      accessToken,
      refreshToken,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  // In a real app, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Déconnexion réussie',
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token manquant');
  }

  try {
    const decoded = verifyToken(refreshToken);

    // Generate new tokens
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    });
    const newRefreshToken = generateRefreshToken({
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    throw new ApiError(401, 'Refresh token invalide ou expiré');
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Don't reveal if user exists
  res.json({
    success: true,
    message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé',
  });

  // TODO: Send password reset email
  if (user) {
    logger.info(`Password reset requested for: ${email}`);
    // Implement email sending logic here
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  // TODO: Implement token verification logic
  // For now, just return success

  res.json({
    success: true,
    message: 'Mot de passe réinitialisé avec succès',
  });
};

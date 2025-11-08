import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getMe = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      roles: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'Utilisateur non trouvé');
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles: user.roles.map((r) => r.role),
    },
  });
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { nom, prenom, telephone, adresse } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      profile: {
        update: {
          nom,
          prenom,
          telephone,
          adresse,
        },
      },
    },
    include: {
      profile: true,
      roles: true,
    },
  });

  logger.info(`User profile updated: ${user.email}`);

  res.json({
    success: true,
    message: 'Profil mis à jour avec succès',
    data: {
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles: user.roles.map((r) => r.role),
    },
  });
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      roles: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'Utilisateur non trouvé');
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles: user.roles.map((r) => r.role),
    },
  });
};

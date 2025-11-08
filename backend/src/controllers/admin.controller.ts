import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listUsers = async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    include: {
      profile: true,
      roles: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: users.map((user) => ({
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles: user.roles.map((r) => r.role),
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    })),
  });
};

export const changeUserRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { roles: true },
  });

  if (!user) {
    throw new ApiError(404, 'Utilisateur non trouvé');
  }

  // Supprimer tous les rôles existants
  await prisma.userRole.deleteMany({
    where: { userId: id },
  });

  // Ajouter le nouveau rôle
  await prisma.userRole.create({
    data: {
      userId: id,
      role,
    },
  });

  logger.info(`User role changed: ${user.email} -> ${role}`);

  res.json({
    success: true,
    message: 'Rôle modifié avec succès',
  });
};

export const getStats = async (req: AuthRequest, res: Response) => {
  const [
    totalUsers,
    totalDossiers,
    totalAudiences,
    dossiersEnCours,
    audiencesPlanifiees,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.dossier.count(),
    prisma.audience.count(),
    prisma.dossier.count({ where: { statut: 'EN_COURS' } }),
    prisma.audience.count({ where: { statut: 'PLANIFIEE' } }),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalDossiers,
      totalAudiences,
      dossiersEnCours,
      audiencesPlanifiees,
    },
  });
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  res.json({
    success: true,
    data: logs,
  });
};

import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listDossiers = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRoles = req.user?.roles || [];

  let dossiers;

  if (userRoles.includes('ADMIN') || userRoles.includes('JUGE') || userRoles.includes('GREFFIER')) {
    // Admins, juges et greffiers voient tous les dossiers
    dossiers = await prisma.dossier.findMany({
      include: {
        juge: { include: { profile: true } },
        avocat: { include: { profile: true } },
        justiciable: { include: { profile: true } },
        audiences: true,
        piecesJointes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } else if (userRoles.includes('AVOCAT')) {
    // Avocats voient leurs dossiers
    dossiers = await prisma.dossier.findMany({
      where: { avocatId: userId },
      include: {
        juge: { include: { profile: true } },
        avocat: { include: { profile: true } },
        justiciable: { include: { profile: true } },
        audiences: true,
        piecesJointes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } else if (userRoles.includes('JUSTICIABLE')) {
    // Justiciables voient leurs dossiers
    dossiers = await prisma.dossier.findMany({
      where: { justiciableId: userId },
      include: {
        juge: { include: { profile: true } },
        avocat: { include: { profile: true } },
        justiciable: { include: { profile: true } },
        audiences: true,
        piecesJointes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } else {
    dossiers = [];
  }

  res.json({
    success: true,
    data: dossiers,
  });
};

export const createDossier = async (req: AuthRequest, res: Response) => {
  const {
    numeroDossier,
    titre,
    description,
    type,
    jugeId,
    avocatId,
    justiciableId,
  } = req.body;

  const dossier = await prisma.dossier.create({
    data: {
      numeroDossier,
      titre,
      description,
      type,
      statut: 'EN_COURS',
      jugeId,
      avocatId,
      justiciableId,
    },
    include: {
      juge: { include: { profile: true } },
      avocat: { include: { profile: true } },
      justiciable: { include: { profile: true } },
    },
  });

  logger.info(`Dossier created: ${dossier.numeroDossier}`);

  res.status(201).json({
    success: true,
    message: 'Dossier créé avec succès',
    data: dossier,
  });
};

export const getDossierById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRoles = req.user?.roles || [];

  const dossier = await prisma.dossier.findUnique({
    where: { id },
    include: {
      juge: { include: { profile: true } },
      avocat: { include: { profile: true } },
      justiciable: { include: { profile: true } },
      audiences: true,
      piecesJointes: true,
      decisions: true,
    },
  });

  if (!dossier) {
    throw new ApiError(404, 'Dossier non trouvé');
  }

  // Vérifier les permissions
  const canAccess =
    userRoles.includes('ADMIN') ||
    userRoles.includes('JUGE') ||
    userRoles.includes('GREFFIER') ||
    dossier.avocatId === userId ||
    dossier.justiciableId === userId;

  if (!canAccess) {
    throw new ApiError(403, 'Accès refusé');
  }

  res.json({
    success: true,
    data: dossier,
  });
};

export const updateDossier = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { titre, description, statut, type } = req.body;

  const dossier = await prisma.dossier.update({
    where: { id },
    data: {
      titre,
      description,
      statut,
      type,
    },
    include: {
      juge: { include: { profile: true } },
      avocat: { include: { profile: true } },
      justiciable: { include: { profile: true } },
    },
  });

  logger.info(`Dossier updated: ${dossier.numeroDossier}`);

  res.json({
    success: true,
    message: 'Dossier mis à jour avec succès',
    data: dossier,
  });
};

export const deleteDossier = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.dossier.delete({
    where: { id },
  });

  logger.info(`Dossier deleted: ${id}`);

  res.json({
    success: true,
    message: 'Dossier supprimé avec succès',
  });
};

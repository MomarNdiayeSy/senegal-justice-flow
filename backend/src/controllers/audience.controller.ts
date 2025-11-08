import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const getPublicAudiences = async (req: AuthRequest, res: Response) => {
  const audiences = await prisma.audience.findMany({
    where: {
      estPublique: true,
      statut: 'PLANIFIEE',
    },
    include: {
      dossier: {
        include: {
          juge: { include: { profile: true } },
        },
      },
    },
    orderBy: { dateAudience: 'asc' },
  });

  res.json({
    success: true,
    data: audiences,
  });
};

export const listAudiences = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRoles = req.user?.roles || [];

  let audiences;

  if (userRoles.includes('ADMIN') || userRoles.includes('JUGE') || userRoles.includes('GREFFIER')) {
    // Admins, juges et greffiers voient toutes les audiences
    audiences = await prisma.audience.findMany({
      include: {
        dossier: {
          include: {
            juge: { include: { profile: true } },
            avocat: { include: { profile: true } },
            justiciable: { include: { profile: true } },
          },
        },
      },
      orderBy: { dateAudience: 'desc' },
    });
  } else {
    // Autres utilisateurs voient les audiences de leurs dossiers
    audiences = await prisma.audience.findMany({
      where: {
        dossier: {
          OR: [
            { avocatId: userId },
            { justiciableId: userId },
          ],
        },
      },
      include: {
        dossier: {
          include: {
            juge: { include: { profile: true } },
            avocat: { include: { profile: true } },
            justiciable: { include: { profile: true } },
          },
        },
      },
      orderBy: { dateAudience: 'desc' },
    });
  }

  res.json({
    success: true,
    data: audiences,
  });
};

export const createAudience = async (req: AuthRequest, res: Response) => {
  const {
    dossierId,
    dateAudience,
    heureDebut,
    heureFin,
    salle,
    type,
    estPublique,
  } = req.body;

  const audience = await prisma.audience.create({
    data: {
      dossierId,
      dateAudience: new Date(dateAudience),
      heureDebut,
      heureFin,
      salle,
      type,
      estPublique: estPublique ?? true,
      statut: 'PLANIFIEE',
    },
    include: {
      dossier: {
        include: {
          juge: { include: { profile: true } },
          avocat: { include: { profile: true } },
          justiciable: { include: { profile: true } },
        },
      },
    },
  });

  logger.info(`Audience created for dossier: ${dossierId}`);

  res.status(201).json({
    success: true,
    message: 'Audience créée avec succès',
    data: audience,
  });
};

export const getAudienceById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRoles = req.user?.roles || [];

  const audience = await prisma.audience.findUnique({
    where: { id },
    include: {
      dossier: {
        include: {
          juge: { include: { profile: true } },
          avocat: { include: { profile: true } },
          justiciable: { include: { profile: true } },
        },
      },
    },
  });

  if (!audience) {
    throw new ApiError(404, 'Audience non trouvée');
  }

  // Vérifier les permissions
  const canAccess =
    userRoles.includes('ADMIN') ||
    userRoles.includes('JUGE') ||
    userRoles.includes('GREFFIER') ||
    audience.dossier.avocatId === userId ||
    audience.dossier.justiciableId === userId;

  if (!canAccess) {
    throw new ApiError(403, 'Accès refusé');
  }

  res.json({
    success: true,
    data: audience,
  });
};

export const updateAudience = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    dateAudience,
    heureDebut,
    heureFin,
    salle,
    type,
    statut,
    estPublique,
    compteRendu,
  } = req.body;

  const audience = await prisma.audience.update({
    where: { id },
    data: {
      dateAudience: dateAudience ? new Date(dateAudience) : undefined,
      heureDebut,
      heureFin,
      salle,
      type,
      statut,
      estPublique,
      compteRendu,
    },
    include: {
      dossier: true,
    },
  });

  logger.info(`Audience updated: ${id}`);

  res.json({
    success: true,
    message: 'Audience mise à jour avec succès',
    data: audience,
  });
};

export const cancelAudience = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const audience = await prisma.audience.update({
    where: { id },
    data: {
      statut: 'ANNULEE',
    },
  });

  logger.info(`Audience cancelled: ${id}`);

  res.json({
    success: true,
    message: 'Audience annulée avec succès',
    data: audience,
  });
};

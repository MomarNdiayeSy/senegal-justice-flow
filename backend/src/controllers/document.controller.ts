import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listPublicDocuments = async (req: AuthRequest, res: Response) => {
  const documents = await prisma.documentPublic.findMany({
    orderBy: { ordre: 'asc' },
  });

  res.json({
    success: true,
    data: documents,
  });
};

export const downloadDocument = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const document = await prisma.documentPublic.findUnique({
    where: { id },
  });

  if (!document) {
    throw new ApiError(404, 'Document non trouvé');
  }

  res.json({
    success: true,
    data: document,
  });
};

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  const { titre, description, type, url, ordre } = req.body;

  const document = await prisma.documentPublic.create({
    data: {
      titre,
      description,
      type,
      url,
      ordre: ordre ?? 0,
    },
  });

  logger.info(`Public document uploaded: ${document.titre}`);

  res.status(201).json({
    success: true,
    message: 'Document téléchargé avec succès',
    data: document,
  });
};

import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { createAuditLog } from '../services/audit.service';

// Liste toutes les salles
export const listSalles = async (req: AuthRequest, res: Response) => {
  const salles = await prisma.salle.findMany({
    orderBy: { nom: 'asc' },
  });

  res.json({
    success: true,
    data: salles,
  });
};

// Récupère les salles disponibles
export const getSallesDisponibles = async (req: AuthRequest, res: Response) => {
  const salles = await prisma.salle.findMany({
    where: { disponible: true },
    orderBy: { nom: 'asc' },
  });

  res.json({
    success: true,
    data: salles,
  });
};

// Récupère une salle par ID
export const getSalleById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const salle = await prisma.salle.findUnique({
    where: { id },
  });

  if (!salle) {
    throw new ApiError(404, 'Salle non trouvée');
  }

  res.json({
    success: true,
    data: salle,
  });
};

// Crée une nouvelle salle
export const createSalle = async (req: AuthRequest, res: Response) => {
  const { nom, capacite, equipements, etage, batiment } = req.body;
  const userId = req.user?.userId;

  // Vérifier si une salle avec ce nom existe déjà
  const existingSalle = await prisma.salle.findUnique({
    where: { nom },
  });

  if (existingSalle) {
    throw new ApiError(409, 'Une salle avec ce nom existe déjà');
  }

  const salle = await prisma.salle.create({
    data: {
      nom,
      capacite: capacite || 50,
      equipements: equipements || [],
      etage,
      batiment,
    },
  });

  // Audit log
  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'Salle',
    entityId: salle.id,
    details: { nom, capacite },
    req,
  });

  logger.info(`Salle created: ${nom}`);

  res.status(201).json({
    success: true,
    message: 'Salle créée avec succès',
    data: salle,
  });
};

// Met à jour une salle
export const updateSalle = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { nom, capacite, equipements, disponible, etage, batiment } = req.body;
  const userId = req.user?.userId;

  const salle = await prisma.salle.findUnique({
    where: { id },
  });

  if (!salle) {
    throw new ApiError(404, 'Salle non trouvée');
  }

  // Si changement de nom, vérifier unicité
  if (nom && nom !== salle.nom) {
    const existingSalle = await prisma.salle.findUnique({
      where: { nom },
    });

    if (existingSalle) {
      throw new ApiError(409, 'Une salle avec ce nom existe déjà');
    }
  }

  const updatedSalle = await prisma.salle.update({
    where: { id },
    data: {
      nom,
      capacite,
      equipements,
      disponible,
      etage,
      batiment,
    },
  });

  // Audit log
  await createAuditLog({
    userId,
    action: 'UPDATE',
    entity: 'Salle',
    entityId: id,
    details: { nom, capacite, disponible },
    req,
  });

  logger.info(`Salle updated: ${id}`);

  res.json({
    success: true,
    message: 'Salle mise à jour avec succès',
    data: updatedSalle,
  });
};

// Supprime une salle
export const deleteSalle = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const salle = await prisma.salle.findUnique({
    where: { id },
  });

  if (!salle) {
    throw new ApiError(404, 'Salle non trouvée');
  }

  // Vérifier si la salle est utilisée dans des audiences futures
  const audiencesFutures = await prisma.audience.count({
    where: {
      salle: salle.nom,
      dateAudience: { gte: new Date() },
      statut: { in: ['PROGRAMMEE', 'EN_COURS'] },
    },
  });

  if (audiencesFutures > 0) {
    throw new ApiError(400, 'Impossible de supprimer une salle avec des audiences programmées');
  }

  await prisma.salle.delete({
    where: { id },
  });

  // Audit log
  await createAuditLog({
    userId,
    action: 'DELETE',
    entity: 'Salle',
    entityId: id,
    details: { nom: salle.nom },
    req,
  });

  logger.info(`Salle deleted: ${id}`);

  res.json({
    success: true,
    message: 'Salle supprimée avec succès',
  });
};

// Vérifier la disponibilité d'une salle
export const checkDisponibilite = async (req: AuthRequest, res: Response) => {
  const { salleNom, date, heureDebut, heureFin, excludeAudienceId } = req.body;

  if (!salleNom || !date || !heureDebut) {
    throw new ApiError(400, 'Paramètres manquants');
  }

  const dateAudience = new Date(date);
  dateAudience.setHours(0, 0, 0, 0);

  // Chercher les audiences conflictuelles
  const whereClause: any = {
    salle: salleNom,
    dateAudience,
    statut: { in: ['PROGRAMMEE', 'EN_COURS'] },
    heureDebut: heureDebut,
  };

  if (excludeAudienceId) {
    whereClause.id = { not: excludeAudienceId };
  }

  const conflits = await prisma.audience.findMany({
    where: whereClause,
    include: {
      dossier: {
        select: { numeroDossier: true, titre: true },
      },
    },
  });

  const disponible = conflits.length === 0;

  res.json({
    success: true,
    data: {
      disponible,
      conflits: disponible ? [] : conflits.map(c => ({
        id: c.id,
        heureDebut: c.heureDebut,
        heureFin: c.heureFin,
        dossier: c.dossier,
      })),
    },
  });
};

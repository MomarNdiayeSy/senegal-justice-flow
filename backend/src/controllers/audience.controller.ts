import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { createAuditLog } from '../services/audit.service';
import { notifyDossierParties } from '../services/notification.service';

// Get public audiences for display board
export const getPublicAudiences = async (req: AuthRequest, res: Response) => {
  const { date } = req.query;
  
  let dateFilter: Date;
  if (date) {
    dateFilter = new Date(date as string);
  } else {
    dateFilter = new Date();
  }
  dateFilter.setHours(0, 0, 0, 0);

  const nextDay = new Date(dateFilter);
  nextDay.setDate(nextDay.getDate() + 1);

  const audiences = await prisma.audience.findMany({
    where: {
      publicationWeb: true,
      dateAudience: { gte: dateFilter, lt: nextDay },
      statut: { not: 'ANNULEE' },
    },
    include: {
      dossier: {
        select: {
          numeroDossier: true,
          titre: true,
          type: true,
          juge: { select: { nom: true, prenom: true } },
          justiciable: { select: { nom: true, prenom: true } },
          avocats: {
            include: { avocat: { select: { nom: true, prenom: true } } },
          },
        },
      },
    },
    orderBy: [{ heureDebut: 'asc' }, { salle: 'asc' }],
  });

  res.json({
    success: true,
    data: audiences,
  });
};

// List audiences with role-based filtering
export const listAudiences = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRoles = req.user?.roles || [];
  const { page = 1, limit = 20, statut, dateDebut, dateFin, salle } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const where: Record<string, unknown> = {};

  // Role-based filtering
  if (userRoles.includes('ADMIN') || userRoles.includes('GREFFIER')) {
    // Full access
  } else if (userRoles.includes('JUGE')) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      where.dossier = { jugeId: profile.id };
    }
  } else if (userRoles.includes('PROCUREUR')) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      where.dossier = { procureurId: profile.id };
    }
  } else if (userRoles.includes('AVOCAT')) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      where.dossier = { avocats: { some: { avocatId: profile.id } } };
    }
  } else if (userRoles.includes('JUSTICIABLE')) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      where.dossier = { justiciableId: profile.id };
    }
  }

  // Additional filters
  if (statut) where.statut = statut;
  if (salle) where.salle = salle;
  if (dateDebut || dateFin) {
    where.dateAudience = {};
    if (dateDebut) (where.dateAudience as Record<string, Date>).gte = new Date(dateDebut as string);
    if (dateFin) (where.dateAudience as Record<string, Date>).lte = new Date(dateFin as string);
  }

  const [audiences, total] = await Promise.all([
    prisma.audience.findMany({
      where,
      include: {
        dossier: {
          include: {
            juge: { select: { nom: true, prenom: true } },
            procureur: { select: { nom: true, prenom: true } },
            justiciable: { select: { nom: true, prenom: true } },
            avocats: { include: { avocat: { select: { nom: true, prenom: true } } } },
          },
        },
      },
      orderBy: { dateAudience: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.audience.count({ where }),
  ]);

  res.json({
    success: true,
    data: audiences,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

// Get audience by ID
export const getAudienceById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const audience = await prisma.audience.findUnique({
    where: { id },
    include: {
      dossier: {
        include: {
          juge: { select: { nom: true, prenom: true, tribunalAttache: true } },
          procureur: { select: { nom: true, prenom: true } },
          justiciable: { select: { nom: true, prenom: true, telephone: true } },
          avocats: { include: { avocat: { select: { nom: true, prenom: true, barreau: true } } } },
        },
      },
    },
  });

  if (!audience) {
    throw new ApiError(404, 'Audience non trouvée');
  }

  res.json({ success: true, data: audience });
};

// Create audience
export const createAudience = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const {
    dossierId,
    dateAudience,
    heureDebut,
    heureFin,
    salle,
    typeAudience,
    objetAudience,
    publicationWeb,
  } = req.body;

  // Check if dossier exists
  const dossier = await prisma.dossier.findUnique({ where: { id: dossierId } });
  if (!dossier) {
    throw new ApiError(404, 'Dossier non trouvé');
  }

  // Check for room conflict
  const audienceDate = new Date(dateAudience);
  const conflict = await prisma.audience.findFirst({
    where: {
      salle,
      dateAudience: audienceDate,
      heureDebut,
      statut: { notIn: ['ANNULEE', 'TERMINEE'] },
    },
  });

  if (conflict) {
    throw new ApiError(409, `La salle ${salle} est déjà réservée à cette date et heure`);
  }

  const audience = await prisma.audience.create({
    data: {
      dossierId,
      dateAudience: audienceDate,
      heureDebut,
      heureFin,
      salle,
      typeAudience,
      objetAudience,
      publicationWeb: publicationWeb ?? true,
      createdBy: userId,
    },
    include: {
      dossier: {
        include: {
          juge: { select: { nom: true, prenom: true } },
          justiciable: { select: { nom: true, prenom: true } },
          avocats: { include: { avocat: { select: { nom: true, prenom: true } } } },
        },
      },
    },
  });

  // Notify all parties
  const formattedDate = audienceDate.toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  await notifyDossierParties(dossierId, {
    type: 'AUDIENCE_CREEE',
    titre: 'Nouvelle audience programmée',
    message: `Une audience a été programmée pour le dossier ${dossier.numeroDossier} le ${formattedDate} à ${heureDebut} en salle ${salle}.`,
    actionUrl: `/audiences/${audience.id}`,
    audienceId: audience.id,
  }, userId);

  await createAuditLog({
    userId,
    action: 'CREATE_AUDIENCE',
    entity: 'Audience',
    entityId: audience.id,
    details: { dossierId, dateAudience, salle },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Audience created for dossier ${dossier.numeroDossier}`);

  res.status(201).json({
    success: true,
    message: 'Audience créée avec succès',
    data: audience,
  });
};

// Update audience
export const updateAudience = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const { dateAudience, heureDebut, heureFin, salle, typeAudience, statut, objetAudience, publicationWeb, observations } = req.body;

  const existingAudience = await prisma.audience.findUnique({
    where: { id },
    include: { dossier: true },
  });

  if (!existingAudience) {
    throw new ApiError(404, 'Audience non trouvée');
  }

  // Check for room conflict if changing date/time/room
  if (dateAudience || heureDebut || salle) {
    const audienceDate = dateAudience ? new Date(dateAudience) : existingAudience.dateAudience;
    const conflict = await prisma.audience.findFirst({
      where: {
        id: { not: id },
        salle: salle || existingAudience.salle,
        dateAudience: audienceDate,
        heureDebut: heureDebut || existingAudience.heureDebut,
        statut: { notIn: ['ANNULEE', 'TERMINEE'] },
      },
    });

    if (conflict) {
      throw new ApiError(409, 'Conflit de réservation de salle');
    }
  }

  const audience = await prisma.audience.update({
    where: { id },
    data: {
      dateAudience: dateAudience ? new Date(dateAudience) : undefined,
      heureDebut,
      heureFin,
      salle,
      typeAudience,
      statut,
      objetAudience,
      publicationWeb,
      observations,
    },
  });

  await createAuditLog({
    userId,
    action: 'UPDATE_AUDIENCE',
    entity: 'Audience',
    entityId: id,
    details: { changes: req.body },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Audience updated: ${id}`);

  res.json({
    success: true,
    message: 'Audience mise à jour avec succès',
    data: audience,
  });
};

// Postpone audience
export const postponeAudience = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const { nouvelleDateAudience, nouvelleHeureDebut, motifReport } = req.body;

  const existingAudience = await prisma.audience.findUnique({
    where: { id },
    include: { dossier: true },
  });

  if (!existingAudience) {
    throw new ApiError(404, 'Audience non trouvée');
  }

  const audience = await prisma.audience.update({
    where: { id },
    data: {
      statut: 'REPORTEE',
      motifReport,
    },
  });

  // Notify parties
  await notifyDossierParties(existingAudience.dossierId, {
    type: 'AUDIENCE_REPORTEE',
    titre: 'Audience reportée',
    message: `L'audience du dossier ${existingAudience.dossier.numeroDossier} a été reportée. Motif: ${motifReport || 'Non spécifié'}`,
    actionUrl: `/audiences/${id}`,
    audienceId: id,
  }, userId);

  // Create new audience if new date provided
  if (nouvelleDateAudience && nouvelleHeureDebut) {
    await prisma.audience.create({
      data: {
        dossierId: existingAudience.dossierId,
        dateAudience: new Date(nouvelleDateAudience),
        heureDebut: nouvelleHeureDebut,
        salle: existingAudience.salle,
        typeAudience: existingAudience.typeAudience,
        objetAudience: existingAudience.objetAudience,
        publicationWeb: existingAudience.publicationWeb,
        observations: `Report de l'audience du ${existingAudience.dateAudience.toLocaleDateString('fr-FR')}`,
        createdBy: userId,
      },
    });
  }

  await createAuditLog({
    userId,
    action: 'POSTPONE_AUDIENCE',
    entity: 'Audience',
    entityId: id,
    details: { motifReport, nouvelleDateAudience },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Audience postponed: ${id}`);

  res.json({
    success: true,
    message: 'Audience reportée avec succès',
    data: audience,
  });
};

// Cancel audience
export const cancelAudience = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const { motif } = req.body;

  const existingAudience = await prisma.audience.findUnique({
    where: { id },
    include: { dossier: true },
  });

  if (!existingAudience) {
    throw new ApiError(404, 'Audience non trouvée');
  }

  const audience = await prisma.audience.update({
    where: { id },
    data: {
      statut: 'ANNULEE',
      motifReport: motif,
    },
  });

  // Notify parties
  await notifyDossierParties(existingAudience.dossierId, {
    type: 'AUDIENCE_ANNULEE',
    titre: 'Audience annulée',
    message: `L'audience du dossier ${existingAudience.dossier.numeroDossier} prévue le ${existingAudience.dateAudience.toLocaleDateString('fr-FR')} a été annulée.`,
    actionUrl: `/dossiers/${existingAudience.dossierId}`,
    audienceId: id,
  }, userId);

  await createAuditLog({
    userId,
    action: 'CANCEL_AUDIENCE',
    entity: 'Audience',
    entityId: id,
    details: { motif },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Audience cancelled: ${id}`);

  res.json({
    success: true,
    message: 'Audience annulée avec succès',
    data: audience,
  });
};

// Get available rooms for a date/time
export const getAvailableRooms = async (req: AuthRequest, res: Response) => {
  const { date, heureDebut } = req.query;

  if (!date || !heureDebut) {
    throw new ApiError(400, 'Date et heure requises');
  }

  const audienceDate = new Date(date as string);

  // Get all rooms
  const allRooms = await prisma.salle.findMany({
    where: { disponible: true },
  });

  // Get occupied rooms
  const occupiedAudiences = await prisma.audience.findMany({
    where: {
      dateAudience: audienceDate,
      heureDebut: heureDebut as string,
      statut: { notIn: ['ANNULEE', 'TERMINEE'] },
    },
    select: { salle: true },
  });

  const occupiedRoomNames = occupiedAudiences.map(a => a.salle);
  const availableRooms = allRooms.filter(r => !occupiedRoomNames.includes(r.nom));

  res.json({
    success: true,
    data: {
      available: availableRooms,
      occupied: occupiedRoomNames,
    },
  });
};

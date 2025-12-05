import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { createAuditLog } from '../services/audit.service';
import { notifyDossierParties, createNotification } from '../services/notification.service';

// List dossiers with role-based filtering
export const listDossiers = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRoles = req.user?.roles || [];
  const { page = 1, limit = 20, statut, type, search } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const where: Record<string, unknown> = {};

  // Role-based filtering
  if (userRoles.includes('ADMIN') || userRoles.includes('GREFFIER')) {
    // Full access
  } else if (userRoles.includes('JUGE')) {
    // Get profile ID for judge
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) where.jugeId = profile.id;
  } else if (userRoles.includes('PROCUREUR')) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) where.procureurId = profile.id;
  } else if (userRoles.includes('AVOCAT')) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      where.avocats = { some: { avocatId: profile.id } };
    }
  } else if (userRoles.includes('JUSTICIABLE')) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) where.justiciableId = profile.id;
  } else {
    return res.json({ success: true, data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  }

  // Additional filters
  if (statut) where.statut = statut;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { numeroDossier: { contains: String(search), mode: 'insensitive' } },
      { titre: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  const [dossiers, total] = await Promise.all([
    prisma.dossier.findMany({
      where,
      include: {
        juge: { select: { id: true, nom: true, prenom: true } },
        procureur: { select: { id: true, nom: true, prenom: true } },
        justiciable: { select: { id: true, nom: true, prenom: true, telephone: true } },
        avocats: {
          include: {
            avocat: { select: { id: true, nom: true, prenom: true, barreau: true } },
          },
        },
        _count: { select: { audiences: true, piecesJointes: true, decisions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.dossier.count({ where }),
  ]);

  res.json({
    success: true,
    data: dossiers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

// Get single dossier
export const getDossierById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRoles = req.user?.roles || [];

  const dossier = await prisma.dossier.findUnique({
    where: { id },
    include: {
      juge: { select: { id: true, nom: true, prenom: true, tribunalAttache: true } },
      procureur: { select: { id: true, nom: true, prenom: true } },
      justiciable: { 
        select: { id: true, nom: true, prenom: true, telephone: true, adresse: true, ville: true },
        include: { user: { select: { email: true } } },
      },
      avocats: {
        include: {
          avocat: { 
            select: { id: true, nom: true, prenom: true, barreau: true, numeroOrdre: true },
            include: { user: { select: { email: true } } },
          },
        },
      },
      audiences: { orderBy: { dateAudience: 'desc' } },
      piecesJointes: { orderBy: { dateUpload: 'desc' } },
      decisions: { orderBy: { createdAt: 'desc' } },
      historique: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });

  if (!dossier) {
    throw new ApiError(404, 'Dossier non trouvé');
  }

  // Check access permission
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const canAccess =
    userRoles.includes('ADMIN') ||
    userRoles.includes('GREFFIER') ||
    (userRoles.includes('JUGE') && dossier.jugeId === profile?.id) ||
    (userRoles.includes('PROCUREUR') && dossier.procureurId === profile?.id) ||
    (userRoles.includes('JUSTICIABLE') && dossier.justiciableId === profile?.id) ||
    (userRoles.includes('AVOCAT') && dossier.avocats.some(a => a.avocatId === profile?.id));

  if (!canAccess) {
    throw new ApiError(403, 'Accès refusé à ce dossier');
  }

  res.json({ success: true, data: dossier });
};

// Create dossier
export const createDossier = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const {
    numeroDossier,
    titre,
    description,
    type,
    tribunal,
    chambre,
    jugeId,
    procureurId,
    justiciableId,
    avocatIds,
    montantLitige,
    observations,
  } = req.body;

  // Check if numeroDossier already exists
  const existing = await prisma.dossier.findUnique({ where: { numeroDossier } });
  if (existing) {
    throw new ApiError(409, 'Un dossier avec ce numéro existe déjà');
  }

  // Create dossier with avocats in transaction
  const dossier = await prisma.$transaction(async (tx) => {
    const newDossier = await tx.dossier.create({
      data: {
        numeroDossier,
        titre,
        description,
        type,
        tribunal,
        chambre,
        jugeId,
        procureurId,
        justiciableId,
        montantLitige,
        observations,
        createdBy: userId,
      },
    });

    // Add avocats
    if (avocatIds && avocatIds.length > 0) {
      await tx.dossierAvocat.createMany({
        data: avocatIds.map((avocatId: string, index: number) => ({
          dossierId: newDossier.id,
          avocatId,
          principal: index === 0,
        })),
      });
    }

    // Create history entry
    await tx.historiqueDossier.create({
      data: {
        dossierId: newDossier.id,
        action: 'Création du dossier',
        userId,
        details: { numeroDossier, titre, type },
      },
    });

    return newDossier;
  });

  // Fetch complete dossier
  const completeDossier = await prisma.dossier.findUnique({
    where: { id: dossier.id },
    include: {
      juge: { select: { nom: true, prenom: true } },
      procureur: { select: { nom: true, prenom: true } },
      justiciable: { select: { nom: true, prenom: true } },
      avocats: { include: { avocat: { select: { nom: true, prenom: true } } } },
    },
  });

  // Send notifications to all parties
  await notifyDossierParties(dossier.id, {
    type: 'DOSSIER_CREE',
    titre: 'Nouveau dossier assigné',
    message: `Vous avez été assigné au dossier ${numeroDossier}: ${titre}`,
    actionUrl: `/dossiers/${dossier.id}`,
  }, userId);

  // Audit log
  await createAuditLog({
    userId,
    action: 'CREATE_DOSSIER',
    entity: 'Dossier',
    entityId: dossier.id,
    details: { numeroDossier, titre },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Dossier created: ${numeroDossier} by user ${userId}`);

  res.status(201).json({
    success: true,
    message: 'Dossier créé avec succès',
    data: completeDossier,
  });
};

// Update dossier
export const updateDossier = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const { titre, description, statut, type, chambre, jugeId, procureurId, avocatIds, observations } = req.body;

  const existingDossier = await prisma.dossier.findUnique({ where: { id } });
  if (!existingDossier) {
    throw new ApiError(404, 'Dossier non trouvé');
  }

  const wasStatusChanged = statut && existingDossier.statut !== statut;

  // Update dossier
  const dossier = await prisma.$transaction(async (tx) => {
    const updated = await tx.dossier.update({
      where: { id },
      data: {
        titre,
        description,
        statut,
        type,
        chambre,
        jugeId,
        procureurId,
        observations,
        dateCloture: (statut === 'CLOS' || statut === 'ARCHIVE') ? new Date() : undefined,
      },
    });

    // Update avocats if provided
    if (avocatIds) {
      await tx.dossierAvocat.deleteMany({ where: { dossierId: id } });
      if (avocatIds.length > 0) {
        await tx.dossierAvocat.createMany({
          data: avocatIds.map((avocatId: string, index: number) => ({
            dossierId: id,
            avocatId,
            principal: index === 0,
          })),
        });
      }
    }

    // Create history entry
    await tx.historiqueDossier.create({
      data: {
        dossierId: id,
        action: 'Modification du dossier',
        userId,
        details: { changes: req.body },
      },
    });

    return updated;
  });

  // Notify parties if status changed to closed/archived
  if (wasStatusChanged && (statut === 'CLOS' || statut === 'ARCHIVE')) {
    await notifyDossierParties(id, {
      type: 'DOSSIER_CLOS',
      titre: 'Dossier clôturé',
      message: `Le dossier ${existingDossier.numeroDossier} a été ${statut === 'CLOS' ? 'clôturé' : 'archivé'}.`,
      actionUrl: `/dossiers/${id}`,
    }, userId);
  }

  await createAuditLog({
    userId,
    action: 'UPDATE_DOSSIER',
    entity: 'Dossier',
    entityId: id,
    details: { changes: req.body },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Dossier updated: ${existingDossier.numeroDossier} by user ${userId}`);

  res.json({
    success: true,
    message: 'Dossier mis à jour avec succès',
    data: dossier,
  });
};

// Delete dossier
export const deleteDossier = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const dossier = await prisma.dossier.findUnique({ where: { id } });
  if (!dossier) {
    throw new ApiError(404, 'Dossier non trouvé');
  }

  await prisma.dossier.delete({ where: { id } });

  await createAuditLog({
    userId,
    action: 'DELETE_DOSSIER',
    entity: 'Dossier',
    entityId: id,
    details: { numeroDossier: dossier.numeroDossier },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Dossier deleted: ${dossier.numeroDossier} by user ${userId}`);

  res.json({
    success: true,
    message: 'Dossier supprimé avec succès',
  });
};

// Add piece jointe
export const addPieceJointe = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const { nom, description, typeFichier, tailleFichier, urlFichier, cheminStockage, confidentiel } = req.body;

  const dossier = await prisma.dossier.findUnique({ where: { id } });
  if (!dossier) {
    throw new ApiError(404, 'Dossier non trouvé');
  }

  const piece = await prisma.pieceJointe.create({
    data: {
      dossierId: id,
      nom,
      description,
      typeFichier,
      tailleFichier,
      urlFichier,
      cheminStockage,
      confidentiel: confidentiel ?? true,
      uploadePar: userId,
    },
  });

  // History
  await prisma.historiqueDossier.create({
    data: {
      dossierId: id,
      action: 'Ajout de pièce jointe',
      userId,
      details: { pieceId: piece.id, nom },
    },
  });

  // Notify parties
  await notifyDossierParties(id, {
    type: 'PIECE_AJOUTEE',
    titre: 'Nouvelle pièce ajoutée',
    message: `Une nouvelle pièce "${nom}" a été ajoutée au dossier ${dossier.numeroDossier}.`,
    actionUrl: `/dossiers/${id}`,
  }, userId);

  logger.info(`Piece jointe added to dossier ${dossier.numeroDossier}`);

  res.status(201).json({
    success: true,
    message: 'Pièce jointe ajoutée avec succès',
    data: piece,
  });
};

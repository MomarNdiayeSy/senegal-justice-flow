import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { createAuditLog } from '../services/audit.service';
import { notifyDossierParties, createNotification } from '../services/notification.service';

// List decisions with role-based filtering
export const listDecisions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRoles = req.user?.roles || [];
  const { page = 1, limit = 20, statut, dossierId } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const where: Record<string, unknown> = {};

  // Role-based filtering
  if (userRoles.includes('ADMIN') || userRoles.includes('GREFFIER')) {
    // Full access
  } else if (userRoles.includes('JUGE')) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) where.jugeId = profile.id;
  } else if (userRoles.includes('AVOCAT') || userRoles.includes('JUSTICIABLE') || userRoles.includes('PROCUREUR')) {
    // Only see published decisions
    where.statut = 'PUBLIEE';
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      if (userRoles.includes('AVOCAT')) {
        where.dossier = { avocats: { some: { avocatId: profile.id } } };
      } else if (userRoles.includes('JUSTICIABLE')) {
        where.dossier = { justiciableId: profile.id };
      } else if (userRoles.includes('PROCUREUR')) {
        where.dossier = { procureurId: profile.id };
      }
    }
  }

  // Additional filters
  if (statut && !where.statut) where.statut = statut;
  if (dossierId) where.dossierId = dossierId;

  const [decisions, total] = await Promise.all([
    prisma.decision.findMany({
      where,
      include: {
        dossier: {
          select: { numeroDossier: true, titre: true, type: true },
        },
        juge: { select: { nom: true, prenom: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.decision.count({ where }),
  ]);

  res.json({
    success: true,
    data: decisions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

// Get decision by ID
export const getDecisionById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const decision = await prisma.decision.findUnique({
    where: { id },
    include: {
      dossier: {
        include: {
          juge: { select: { nom: true, prenom: true } },
          procureur: { select: { nom: true, prenom: true } },
          justiciable: { select: { nom: true, prenom: true } },
          avocats: { include: { avocat: { select: { nom: true, prenom: true } } } },
        },
      },
      juge: { select: { nom: true, prenom: true, tribunalAttache: true } },
    },
  });

  if (!decision) {
    throw new ApiError(404, 'Décision non trouvée');
  }

  res.json({ success: true, data: decision });
};

// Create decision (by Judge)
export const createDecision = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const {
    dossierId,
    numeroDecision,
    typeDecision,
    dateDelibere,
    dispositif,
    motivationComplete,
    sensPrononce,
  } = req.body;

  // Get judge profile
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(400, 'Profil utilisateur non trouvé');
  }

  // Check dossier exists and judge is assigned
  const dossier = await prisma.dossier.findUnique({ where: { id: dossierId } });
  if (!dossier) {
    throw new ApiError(404, 'Dossier non trouvé');
  }

  if (dossier.jugeId !== profile.id) {
    throw new ApiError(403, 'Vous n\'êtes pas le juge assigné à ce dossier');
  }

  // Check if numeroDecision is unique
  const existing = await prisma.decision.findUnique({ where: { numeroDecision } });
  if (existing) {
    throw new ApiError(409, 'Une décision avec ce numéro existe déjà');
  }

  const decision = await prisma.decision.create({
    data: {
      dossierId,
      numeroDecision,
      typeDecision,
      dateDelibere: new Date(dateDelibere),
      dispositif,
      motivationComplete,
      sensPrononce,
      jugeId: profile.id,
      statut: 'BROUILLON',
    },
    include: {
      dossier: { select: { numeroDossier: true, titre: true } },
      juge: { select: { nom: true, prenom: true } },
    },
  });

  await createAuditLog({
    userId,
    action: 'CREATE_DECISION',
    entity: 'Decision',
    entityId: decision.id,
    details: { numeroDecision, dossierId },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Decision created: ${numeroDecision} by judge ${profile.nom} ${profile.prenom}`);

  res.status(201).json({
    success: true,
    message: 'Décision créée avec succès',
    data: decision,
  });
};

// Update decision
export const updateDecision = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const { dispositif, motivationComplete, sensPrononce, typeDecision } = req.body;

  const decision = await prisma.decision.findUnique({ where: { id } });
  if (!decision) {
    throw new ApiError(404, 'Décision non trouvée');
  }

  // Only allow updates if status is BROUILLON
  if (decision.statut !== 'BROUILLON') {
    throw new ApiError(400, 'Cette décision ne peut plus être modifiée');
  }

  const updated = await prisma.decision.update({
    where: { id },
    data: { dispositif, motivationComplete, sensPrononce, typeDecision },
  });

  await createAuditLog({
    userId,
    action: 'UPDATE_DECISION',
    entity: 'Decision',
    entityId: id,
    details: { changes: req.body },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Décision mise à jour avec succès',
    data: updated,
  });
};

// Submit decision for validation (by Judge)
export const submitForValidation = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const decision = await prisma.decision.findUnique({
    where: { id },
    include: { dossier: true },
  });

  if (!decision) {
    throw new ApiError(404, 'Décision non trouvée');
  }

  if (decision.statut !== 'BROUILLON') {
    throw new ApiError(400, 'Cette décision a déjà été soumise');
  }

  const updated = await prisma.decision.update({
    where: { id },
    data: { statut: 'EN_ATTENTE_VALIDATION' },
  });

  // Notify greffiers
  const greffiers = await prisma.userRole.findMany({
    where: { role: 'GREFFIER' },
    include: { user: { select: { id: true } } },
  });

  for (const g of greffiers) {
    await createNotification({
      userId: g.user.id,
      type: 'DECISION_RENDUE',
      titre: 'Nouvelle décision à valider',
      message: `La décision ${decision.numeroDecision} du dossier ${decision.dossier.numeroDossier} est en attente de validation.`,
      actionUrl: `/greffier/validation-decisions`,
    });
  }

  await createAuditLog({
    userId,
    action: 'SUBMIT_DECISION_VALIDATION',
    entity: 'Decision',
    entityId: id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Decision ${decision.numeroDecision} submitted for validation`);

  res.json({
    success: true,
    message: 'Décision soumise pour validation',
    data: updated,
  });
};

// Validate decision (by Greffier)
export const validateDecision = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const decision = await prisma.decision.findUnique({
    where: { id },
    include: { dossier: true, juge: { include: { user: true } } },
  });

  if (!decision) {
    throw new ApiError(404, 'Décision non trouvée');
  }

  if (decision.statut !== 'EN_ATTENTE_VALIDATION') {
    throw new ApiError(400, 'Cette décision n\'est pas en attente de validation');
  }

  const updated = await prisma.decision.update({
    where: { id },
    data: {
      statut: 'VALIDEE',
      validePar: userId,
      dateValidation: new Date(),
    },
  });

  // Notify judge
  if (decision.juge?.user?.id) {
    await createNotification({
      userId: decision.juge.user.id,
      type: 'DECISION_VALIDEE',
      titre: 'Décision validée',
      message: `Votre décision ${decision.numeroDecision} a été validée par le greffe.`,
      actionUrl: `/juge/decisions`,
    });
  }

  await createAuditLog({
    userId,
    action: 'VALIDATE_DECISION',
    entity: 'Decision',
    entityId: id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Decision ${decision.numeroDecision} validated by greffier ${userId}`);

  res.json({
    success: true,
    message: 'Décision validée avec succès',
    data: updated,
  });
};

// Publish decision (by Greffier)
export const publishDecision = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const decision = await prisma.decision.findUnique({
    where: { id },
    include: { dossier: true },
  });

  if (!decision) {
    throw new ApiError(404, 'Décision non trouvée');
  }

  if (decision.statut !== 'VALIDEE') {
    throw new ApiError(400, 'Cette décision doit d\'abord être validée');
  }

  const updated = await prisma.decision.update({
    where: { id },
    data: {
      statut: 'PUBLIEE',
      publicationWeb: true,
      datePublication: new Date(),
      datePrononce: new Date(),
    },
  });

  // Notify all dossier parties
  await notifyDossierParties(decision.dossierId, {
    type: 'DECISION_PUBLIEE',
    titre: 'Décision publiée',
    message: `La décision ${decision.numeroDecision} concernant le dossier ${decision.dossier.numeroDossier} a été publiée.`,
    actionUrl: `/decisions/${decision.id}`,
  });

  await createAuditLog({
    userId,
    action: 'PUBLISH_DECISION',
    entity: 'Decision',
    entityId: id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Decision ${decision.numeroDecision} published`);

  res.json({
    success: true,
    message: 'Décision publiée avec succès',
    data: updated,
  });
};

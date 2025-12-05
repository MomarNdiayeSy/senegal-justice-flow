import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { createAuditLog } from '../services/audit.service';
import { createNotification } from '../services/notification.service';

// List instructions
export const listInstructions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const userRoles = req.user?.roles || [];
  const { page = 1, limit = 20, statut, type } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const where: Record<string, unknown> = {};

  // Role-based filtering
  const profile = await prisma.profile.findUnique({ where: { userId } });
  
  if (userRoles.includes('JUGE')) {
    if (profile) where.jugeId = profile.id;
  } else if (userRoles.includes('GREFFIER')) {
    // Greffiers see instructions assigned to them or unassigned
    if (profile) {
      where.OR = [
        { greffierId: profile.id },
        { greffierId: null },
      ];
    }
  } else if (!userRoles.includes('ADMIN')) {
    return res.json({ success: true, data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } });
  }

  // Additional filters
  if (statut) where.statut = statut;
  if (type) where.type = type;

  const [instructions, total] = await Promise.all([
    prisma.instruction.findMany({
      where,
      include: {
        juge: { select: { nom: true, prenom: true } },
        greffier: { select: { nom: true, prenom: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.instruction.count({ where }),
  ]);

  res.json({
    success: true,
    data: instructions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

// Get instruction by ID
export const getInstructionById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const instruction = await prisma.instruction.findUnique({
    where: { id },
    include: {
      juge: { select: { nom: true, prenom: true, tribunalAttache: true } },
      greffier: { select: { nom: true, prenom: true } },
    },
  });

  if (!instruction) {
    throw new ApiError(404, 'Instruction non trouvée');
  }

  res.json({ success: true, data: instruction });
};

// Create instruction (by Judge)
export const createInstruction = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const {
    type,
    titre,
    description,
    priorite,
    dossierId,
    audienceId,
    dateEcheance,
    greffierId,
  } = req.body;

  // Get judge profile
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(400, 'Profil utilisateur non trouvé');
  }

  const instruction = await prisma.instruction.create({
    data: {
      type,
      titre,
      description,
      priorite: priorite || 'normale',
      jugeId: profile.id,
      greffierId,
      dossierId,
      audienceId,
      dateEcheance: dateEcheance ? new Date(dateEcheance) : undefined,
    },
    include: {
      juge: { select: { nom: true, prenom: true } },
    },
  });

  // Notify greffier if assigned
  if (greffierId) {
    const greffier = await prisma.profile.findUnique({
      where: { id: greffierId },
      include: { user: true },
    });

    if (greffier?.user) {
      await createNotification({
        userId: greffier.user.id,
        type: 'INSTRUCTION_ENVOYEE',
        titre: 'Nouvelle instruction',
        message: `Le juge ${profile.nom} ${profile.prenom} vous a envoyé une instruction: ${titre}`,
        actionUrl: `/greffier/instructions`,
      });
    }
  } else {
    // Notify all greffiers
    const greffiers = await prisma.userRole.findMany({
      where: { role: 'GREFFIER' },
      include: { user: { select: { id: true } } },
    });

    for (const g of greffiers) {
      await createNotification({
        userId: g.user.id,
        type: 'INSTRUCTION_ENVOYEE',
        titre: 'Nouvelle instruction',
        message: `Le juge ${profile.nom} ${profile.prenom} a créé une instruction: ${titre}`,
        actionUrl: `/greffier/instructions`,
      });
    }
  }

  await createAuditLog({
    userId,
    action: 'CREATE_INSTRUCTION',
    entity: 'Instruction',
    entityId: instruction.id,
    details: { titre, type },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Instruction created: ${titre} by judge ${profile.nom}`);

  res.status(201).json({
    success: true,
    message: 'Instruction créée avec succès',
    data: instruction,
  });
};

// Take instruction (by Greffier)
export const takeInstruction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const instruction = await prisma.instruction.findUnique({ where: { id } });
  if (!instruction) {
    throw new ApiError(404, 'Instruction non trouvée');
  }

  if (instruction.greffierId) {
    throw new ApiError(400, 'Cette instruction est déjà assignée');
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) {
    throw new ApiError(400, 'Profil utilisateur non trouvé');
  }

  const updated = await prisma.instruction.update({
    where: { id },
    data: {
      greffierId: profile.id,
      statut: 'EN_COURS',
    },
  });

  await createAuditLog({
    userId,
    action: 'TAKE_INSTRUCTION',
    entity: 'Instruction',
    entityId: id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Instruction prise en charge',
    data: updated,
  });
};

// Complete instruction (by Greffier)
export const completeInstruction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const { commentaire } = req.body;

  const instruction = await prisma.instruction.findUnique({
    where: { id },
    include: { juge: { include: { user: true } } },
  });

  if (!instruction) {
    throw new ApiError(404, 'Instruction non trouvée');
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });

  const updated = await prisma.instruction.update({
    where: { id },
    data: {
      statut: 'TRAITEE',
      dateTraitement: new Date(),
      commentaire,
    },
  });

  // Notify judge
  if (instruction.juge?.user) {
    await createNotification({
      userId: instruction.juge.user.id,
      type: 'INSTRUCTION_TRAITEE',
      titre: 'Instruction traitée',
      message: `Votre instruction "${instruction.titre}" a été traitée par ${profile?.nom} ${profile?.prenom}.`,
      actionUrl: `/juge/instructions`,
    });
  }

  await createAuditLog({
    userId,
    action: 'COMPLETE_INSTRUCTION',
    entity: 'Instruction',
    entityId: id,
    details: { commentaire },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  logger.info(`Instruction completed: ${instruction.titre}`);

  res.json({
    success: true,
    message: 'Instruction marquée comme traitée',
    data: updated,
  });
};

// Cancel instruction (by Judge)
export const cancelInstruction = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const instruction = await prisma.instruction.findUnique({ where: { id } });
  if (!instruction) {
    throw new ApiError(404, 'Instruction non trouvée');
  }

  const updated = await prisma.instruction.update({
    where: { id },
    data: { statut: 'ANNULEE' },
  });

  await createAuditLog({
    userId,
    action: 'CANCEL_INSTRUCTION',
    entity: 'Instruction',
    entityId: id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Instruction annulée',
    data: updated,
  });
};

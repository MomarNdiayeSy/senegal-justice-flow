import { Response } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export const listNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({
    success: true,
    data: notifications,
  });
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new ApiError(404, 'Notification non trouvée');
  }

  if (notification.userId !== userId) {
    throw new ApiError(403, 'Accès refusé');
  }

  await prisma.notification.update({
    where: { id },
    data: { lue: true },
  });

  logger.info(`Notification marked as read: ${id}`);

  res.json({
    success: true,
    message: 'Notification marquée comme lue',
  });
};

export const getPreferences = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  let preferences = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!preferences) {
    // Créer des préférences par défaut
    preferences = await prisma.notificationPreference.create({
      data: {
        userId: userId!,
        emailAudience: true,
        emailDecision: true,
        emailDocument: true,
        smsAudience: true,
        smsDecision: false,
        smsDocument: false,
        whatsappAudience: false,
        whatsappDecision: false,
        whatsappDocument: false,
      },
    });
  }

  res.json({
    success: true,
    data: preferences,
  });
};

export const updatePreferences = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const {
    emailAudience,
    emailDecision,
    emailDocument,
    smsAudience,
    smsDecision,
    smsDocument,
    whatsappAudience,
    whatsappDecision,
    whatsappDocument,
  } = req.body;

  const preferences = await prisma.notificationPreference.upsert({
    where: { userId: userId! },
    update: {
      emailAudience,
      emailDecision,
      emailDocument,
      smsAudience,
      smsDecision,
      smsDocument,
      whatsappAudience,
      whatsappDecision,
      whatsappDocument,
    },
    create: {
      userId: userId!,
      emailAudience: emailAudience ?? true,
      emailDecision: emailDecision ?? true,
      emailDocument: emailDocument ?? true,
      smsAudience: smsAudience ?? false,
      smsDecision: smsDecision ?? false,
      smsDocument: smsDocument ?? false,
      whatsappAudience: whatsappAudience ?? false,
      whatsappDecision: whatsappDecision ?? false,
      whatsappDocument: whatsappDocument ?? false,
    },
  });

  logger.info(`Notification preferences updated for user: ${userId}`);

  res.json({
    success: true,
    message: 'Préférences mises à jour avec succès',
    data: preferences,
  });
};

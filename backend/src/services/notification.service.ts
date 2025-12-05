import { prisma } from '../config/prisma';
import { TypeNotification, CanalNotification, StatutNotification } from '@prisma/client';
import { logger } from '../utils/logger';
import { config } from '../config/env';

// Types
interface CreateNotificationParams {
  userId: string;
  type: TypeNotification;
  titre: string;
  message: string;
  canal?: CanalNotification;
  actionUrl?: string;
  dossierId?: string;
  audienceId?: string;
  metadata?: Record<string, unknown>;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface SendSmsParams {
  to: string;
  message: string;
}

// Email Service (using Resend)
export const sendEmail = async ({ to, subject, html }: SendEmailParams): Promise<boolean> => {
  if (!config.resendApiKey) {
    logger.warn('RESEND_API_KEY not configured, skipping email');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.emailFromName} <${config.emailFrom}>`,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    logger.info(`Email sent to ${to}`);
    return true;
  } catch (error) {
    logger.error('Email sending failed:', error);
    return false;
  }
};

// SMS Service (using Twilio)
export const sendSms = async ({ to, message }: SendSmsParams): Promise<boolean> => {
  if (!config.twilioAccountSid || !config.twilioAuthToken) {
    logger.warn('Twilio not configured, skipping SMS');
    return false;
  }

  try {
    const auth = Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: config.twilioPhoneNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send SMS');
    }

    logger.info(`SMS sent to ${to}`);
    return true;
  } catch (error) {
    logger.error('SMS sending failed:', error);
    return false;
  }
};

// WhatsApp Service (using Twilio)
export const sendWhatsApp = async ({ to, message }: SendSmsParams): Promise<boolean> => {
  if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioWhatsappNumber) {
    logger.warn('Twilio WhatsApp not configured, skipping');
    return false;
  }

  try {
    const auth = Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:${to}`,
          From: config.twilioWhatsappNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send WhatsApp');
    }

    logger.info(`WhatsApp message sent to ${to}`);
    return true;
  } catch (error) {
    logger.error('WhatsApp sending failed:', error);
    return false;
  }
};

// Create and send notification
export const createNotification = async (params: CreateNotificationParams) => {
  const { userId, type, titre, message, canal = 'IN_APP', actionUrl, dossierId, audienceId, metadata } = params;

  // Create notification in database
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      titre,
      message,
      canal,
      statut: 'EN_ATTENTE',
      actionUrl,
      dossierId,
      audienceId,
      metadata,
    },
  });

  // Get user info for external notifications
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    logger.warn(`User ${userId} not found for notification`);
    return notification;
  }

  // Check user preferences
  const preference = await prisma.notificationPreference.findFirst({
    where: { userId, type, canal, active: true },
  });

  // Send notification based on channel
  let sent = false;

  if (canal === 'EMAIL' && user.email) {
    sent = await sendEmail({
      to: user.email,
      subject: titre,
      html: generateEmailTemplate(titre, message, actionUrl),
    });
  } else if (canal === 'SMS' && user.profile?.telephone) {
    sent = await sendSms({
      to: user.profile.telephone,
      message: `${titre}: ${message}`,
    });
  } else if (canal === 'WHATSAPP' && user.profile?.telephone) {
    sent = await sendWhatsApp({
      to: user.profile.telephone,
      message: `${titre}: ${message}`,
    });
  } else if (canal === 'IN_APP') {
    sent = true; // In-app notifications are always "sent"
  }

  // Update notification status
  await prisma.notification.update({
    where: { id: notification.id },
    data: {
      statut: sent ? 'ENVOYE' : 'ECHEC',
      dateEnvoi: sent ? new Date() : undefined,
      tentatives: { increment: 1 },
      erreur: sent ? undefined : 'Échec de l\'envoi',
    },
  });

  return notification;
};

// Bulk notification to multiple users
export const createBulkNotifications = async (
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) => {
  const notifications = await Promise.all(
    userIds.map(userId => createNotification({ ...params, userId }))
  );
  return notifications;
};

// Send notification to all parties of a dossier
export const notifyDossierParties = async (
  dossierId: string,
  params: Omit<CreateNotificationParams, 'userId' | 'dossierId'>,
  excludeUserId?: string
) => {
  const dossier = await prisma.dossier.findUnique({
    where: { id: dossierId },
    include: {
      juge: { include: { user: true } },
      procureur: { include: { user: true } },
      justiciable: { include: { user: true } },
      avocats: { include: { avocat: { include: { user: true } } } },
    },
  });

  if (!dossier) {
    logger.warn(`Dossier ${dossierId} not found for notifications`);
    return [];
  }

  const userIds: string[] = [];

  if (dossier.juge?.user?.id && dossier.juge.user.id !== excludeUserId) {
    userIds.push(dossier.juge.user.id);
  }
  if (dossier.procureur?.user?.id && dossier.procureur.user.id !== excludeUserId) {
    userIds.push(dossier.procureur.user.id);
  }
  if (dossier.justiciable?.user?.id && dossier.justiciable.user.id !== excludeUserId) {
    userIds.push(dossier.justiciable.user.id);
  }
  
  dossier.avocats.forEach(da => {
    if (da.avocat?.user?.id && da.avocat.user.id !== excludeUserId) {
      userIds.push(da.avocat.user.id);
    }
  });

  return createBulkNotifications(userIds, { ...params, dossierId });
};

// Email template generator
const generateEmailTemplate = (titre: string, message: string, actionUrl?: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${titre}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #003366, #004d99); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
        .button { display: inline-block; background: #003366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>e-Justice Sénégal</h1>
        </div>
        <div class="content">
          <h2>${titre}</h2>
          <p>${message}</p>
          ${actionUrl ? `<a href="${actionUrl}" class="button">Voir les détails</a>` : ''}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} e-Justice Sénégal - Ministère de la Justice</p>
          <p>Ceci est un message automatique, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

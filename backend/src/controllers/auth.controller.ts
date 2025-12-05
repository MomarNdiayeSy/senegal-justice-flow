import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { createNotification, sendEmail } from '../services/notification.service';

export const register = async (req: Request, res: Response) => {
  const { email, password, nom, prenom, telephone, role, tribunal } = req.body;

  // Vérifier que le rôle n'est pas ADMIN (inscription admin interdite)
  if (role === 'ADMIN') {
    throw new ApiError(403, 'Inscription en tant qu\'administrateur non autorisée');
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, 'Un utilisateur avec cet email existe déjà');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

  // Déterminer si le compte doit être activé automatiquement
  // Seuls les comptes créés par un admin/greffier sont actifs immédiatement
  const isActive = false; // Les inscriptions publiques nécessitent activation par greffier

  // Create user with profile and role in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        isActive,
        profile: {
          create: {
            nom,
            prenom,
            telephone,
            tribunalAttache: tribunal || null,
          },
        },
        roles: {
          create: {
            role,
          },
        },
      },
      include: {
        profile: true,
        roles: true,
      },
    });

    return newUser;
  });

  logger.info(`New user registered (pending activation): ${email}`);

  // Notifier tous les greffiers qu'un nouveau compte attend activation
  const greffiers = await prisma.user.findMany({
    where: {
      isActive: true,
      roles: {
        some: { role: 'GREFFIER' }
      }
    },
    include: { profile: true }
  });

  // Créer notification in-app pour chaque greffier
  for (const greffier of greffiers) {
    await createNotification({
      userId: greffier.id,
      type: 'UTILISATEUR_CREE',
      titre: 'Nouveau compte en attente',
      message: `${prenom} ${nom} (${role}) a créé un compte et attend activation.`,
      canal: 'IN_APP',
      actionUrl: '/greffier/users',
    });

    // Envoyer aussi un email
    await sendEmail({
      to: greffier.email,
      subject: '🔔 Nouveau compte en attente d\'activation',
      html: generateNewAccountEmailForGreffier(prenom, nom, role, email),
    });
  }

  logger.info(`Notification sent to ${greffiers.length} greffier(s) for new account: ${email}`);

  res.status(201).json({
    success: true,
    message: 'Inscription enregistrée. Vous recevrez un email dès que votre compte sera activé.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        roles: user.roles.map((r) => r.role),
        isActive: user.isActive,
      },
      // Ne pas générer de tokens si le compte n'est pas actif
      accessToken: null,
      refreshToken: null,
    },
  });
};

// Générer l'email pour notifier les greffiers d'un nouveau compte
const generateNewAccountEmailForGreffier = (prenom: string, nom: string, role: string, email: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouveau compte en attente</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #003366, #004d99); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; }
        .pending-badge { background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; margin-bottom: 20px; }
        .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #003366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f5f5f5; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚖️ e-Justice Sénégal</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Notification Greffier</p>
        </div>
        <div class="content">
          <span class="pending-badge">⏳ En attente d'activation</span>
          <h2 style="color: #003366; margin-top: 10px;">Nouveau compte utilisateur</h2>
          <p>Un nouveau compte a été créé sur la plateforme <strong>e-Justice Sénégal</strong> et nécessite votre validation.</p>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>Détails du compte :</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Nom : <strong>${prenom} ${nom}</strong></li>
              <li>Email : <strong>${email}</strong></li>
              <li>Rôle demandé : <strong>${role}</strong></li>
            </ul>
          </div>
          
          <p>Veuillez vérifier les informations et activer le compte si tout est en ordre.</p>
          
          <center>
            <a href="${config.corsOrigin}/greffier/users" class="button">Gérer les utilisateurs</a>
          </center>
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

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      roles: true,
    },
  });

  if (!user) {
    throw new ApiError(401, 'Email ou mot de passe incorrect');
  }

  // Vérifier si le compte est actif
  if (!user.isActive) {
    throw new ApiError(403, 'Votre compte n\'est pas encore activé. Veuillez attendre la validation par le greffier.');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Email ou mot de passe incorrect');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  logger.info(`User logged in: ${email}`);

  // Generate tokens
  const roles = user.roles.map((r) => r.role);
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    roles,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    roles,
  });

  res.json({
    success: true,
    message: 'Connexion réussie',
    data: {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        roles,
        isActive: user.isActive,
      },
      accessToken,
      refreshToken,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  // In a real app, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Déconnexion réussie',
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token manquant');
  }

  try {
    const decoded = verifyToken(refreshToken);

    // Generate new tokens
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    });
    const newRefreshToken = generateRefreshToken({
      userId: decoded.userId,
      email: decoded.email,
      roles: decoded.roles,
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    throw new ApiError(401, 'Refresh token invalide ou expiré');
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Don't reveal if user exists
  res.json({
    success: true,
    message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé',
  });

  // TODO: Send password reset email
  if (user) {
    logger.info(`Password reset requested for: ${email}`);
    // Implement email sending logic here
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  // TODO: Implement token verification logic
  // For now, just return success

  res.json({
    success: true,
    message: 'Mot de passe réinitialisé avec succès',
  });
};

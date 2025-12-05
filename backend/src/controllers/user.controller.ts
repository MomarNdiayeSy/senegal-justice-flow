import { Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export const getMe = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      roles: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'Utilisateur non trouvé');
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles: user.roles.map((r) => r.role),
      isActive: user.isActive,
    },
  });
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { nom, prenom, telephone, adresse } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      profile: {
        update: {
          nom,
          prenom,
          telephone,
          adresse,
        },
      },
    },
    include: {
      profile: true,
      roles: true,
    },
  });

  logger.info(`User profile updated: ${user.email}`);

  res.json({
    success: true,
    message: 'Profil mis à jour avec succès',
    data: {
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles: user.roles.map((r) => r.role),
      isActive: user.isActive,
    },
  });
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      roles: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'Utilisateur non trouvé');
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles: user.roles.map((r) => r.role),
      isActive: user.isActive,
    },
  });
};

// Liste tous les utilisateurs (Admin/Greffier)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const { role, status, search } = req.query;
  const userRoles = req.user?.roles || [];

  // Seuls Admin et Greffier peuvent lister les utilisateurs
  if (!userRoles.includes('ADMIN') && !userRoles.includes('GREFFIER')) {
    throw new ApiError(403, 'Accès non autorisé');
  }

  const where: any = {};

  // Filtre par rôle
  if (role && role !== '__all__') {
    where.roles = {
      some: {
        role: role as string,
      },
    };
  }

  // Filtre par statut
  if (status === 'actif') {
    where.isActive = true;
  } else if (status === 'inactif') {
    where.isActive = false;
  }

  // Recherche par nom/email
  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { profile: { nom: { contains: search as string, mode: 'insensitive' } } },
      { profile: { prenom: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  // Greffier ne peut pas voir les admins/greffiers
  if (userRoles.includes('GREFFIER') && !userRoles.includes('ADMIN')) {
    where.roles = {
      ...where.roles,
      none: {
        role: { in: ['ADMIN', 'GREFFIER'] },
      },
    };
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      profile: true,
      roles: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: users.map((user) => ({
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles: user.roles.map((r) => r.role),
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    })),
  });
};

// Activer un compte utilisateur (Greffier/Admin)
export const activateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userRoles = req.user?.roles || [];

  if (!userRoles.includes('ADMIN') && !userRoles.includes('GREFFIER')) {
    throw new ApiError(403, 'Accès non autorisé');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: { roles: true, profile: true },
  });

  if (!targetUser) {
    throw new ApiError(404, 'Utilisateur non trouvé');
  }

  // Greffier ne peut pas activer admin/greffier
  const targetRoles = targetUser.roles.map((r) => r.role);
  if (userRoles.includes('GREFFIER') && !userRoles.includes('ADMIN')) {
    if (targetRoles.includes('ADMIN') || targetRoles.includes('GREFFIER')) {
      throw new ApiError(403, 'Vous ne pouvez pas activer ce type de compte');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: true },
    include: { profile: true, roles: true },
  });

  logger.info(`User activated: ${updatedUser.email} by ${req.user?.email}`);

  res.json({
    success: true,
    message: `Compte de ${updatedUser.profile?.prenom} ${updatedUser.profile?.nom} activé avec succès`,
    data: {
      id: updatedUser.id,
      email: updatedUser.email,
      isActive: updatedUser.isActive,
    },
  });
};

// Désactiver un compte utilisateur (Greffier/Admin)
export const deactivateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userRoles = req.user?.roles || [];

  if (!userRoles.includes('ADMIN') && !userRoles.includes('GREFFIER')) {
    throw new ApiError(403, 'Accès non autorisé');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: { roles: true, profile: true },
  });

  if (!targetUser) {
    throw new ApiError(404, 'Utilisateur non trouvé');
  }

  // Ne peut pas désactiver son propre compte
  if (targetUser.id === req.user?.userId) {
    throw new ApiError(400, 'Vous ne pouvez pas désactiver votre propre compte');
  }

  // Greffier ne peut pas désactiver admin/greffier
  const targetRoles = targetUser.roles.map((r) => r.role);
  if (userRoles.includes('GREFFIER') && !userRoles.includes('ADMIN')) {
    if (targetRoles.includes('ADMIN') || targetRoles.includes('GREFFIER')) {
      throw new ApiError(403, 'Vous ne pouvez pas désactiver ce type de compte');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    include: { profile: true, roles: true },
  });

  logger.info(`User deactivated: ${updatedUser.email} by ${req.user?.email}`);

  res.json({
    success: true,
    message: `Compte de ${updatedUser.profile?.prenom} ${updatedUser.profile?.nom} désactivé`,
    data: {
      id: updatedUser.id,
      email: updatedUser.email,
      isActive: updatedUser.isActive,
    },
  });
};

// Créer un utilisateur (Admin/Greffier) - compte actif par défaut
export const createUser = async (req: AuthRequest, res: Response) => {
  const { email, password, nom, prenom, telephone, role, tribunal } = req.body;
  const userRoles = req.user?.roles || [];

  if (!userRoles.includes('ADMIN') && !userRoles.includes('GREFFIER')) {
    throw new ApiError(403, 'Accès non autorisé');
  }

  // Greffier ne peut pas créer admin/greffier
  if (userRoles.includes('GREFFIER') && !userRoles.includes('ADMIN')) {
    if (role === 'ADMIN' || role === 'GREFFIER') {
      throw new ApiError(403, 'Vous ne pouvez pas créer ce type de compte');
    }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, 'Un utilisateur avec cet email existe déjà');
  }

  const passwordHash = await bcrypt.hash(password || 'Password123!', config.bcryptRounds);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        isActive: true, // Comptes créés par admin/greffier sont actifs
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

  logger.info(`User created by ${req.user?.email}: ${email}`);

  res.status(201).json({
    success: true,
    message: `Utilisateur ${prenom} ${nom} créé avec succès`,
    data: {
      id: user.id,
      email: user.email,
      profile: user.profile,
      roles: user.roles.map((r) => r.role),
      isActive: user.isActive,
    },
  });
};

// Supprimer un utilisateur (Admin uniquement)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userRoles = req.user?.roles || [];

  if (!userRoles.includes('ADMIN')) {
    throw new ApiError(403, 'Seul un administrateur peut supprimer un utilisateur');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });

  if (!targetUser) {
    throw new ApiError(404, 'Utilisateur non trouvé');
  }

  if (targetUser.id === req.user?.userId) {
    throw new ApiError(400, 'Vous ne pouvez pas supprimer votre propre compte');
  }

  await prisma.user.delete({
    where: { id },
  });

  logger.info(`User deleted: ${targetUser.email} by ${req.user?.email}`);

  res.json({
    success: true,
    message: `Utilisateur ${targetUser.profile?.prenom} ${targetUser.profile?.nom} supprimé`,
  });
};

import { prisma } from '../config/prisma';
import { logger } from '../utils/logger';

interface AuditLogParams {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (params: AuditLogParams) => {
  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });

    logger.info(`Audit log created: ${params.action} on ${params.entity}`);
    return log;
  } catch (error) {
    logger.error('Failed to create audit log:', error);
    throw error;
  }
};

export const getAuditLogs = async (filters: {
  userId?: string;
  entity?: string;
  entityId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) => {
  const { page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.entity) where.entity = filters.entity;
  if (filters.entityId) where.entityId = filters.entityId;
  if (filters.action) where.action = { contains: filters.action, mode: 'insensitive' };
  
  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) (where.timestamp as Record<string, Date>).gte = filters.startDate;
    if (filters.endDate) (where.timestamp as Record<string, Date>).lte = filters.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { nom: true, prenom: true } },
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Detect suspicious activity
export const detectSuspiciousActivity = async (userId: string): Promise<boolean> => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  // Check for multiple failed login attempts
  const failedLogins = await prisma.auditLog.count({
    where: {
      userId,
      action: 'LOGIN_FAILED',
      timestamp: { gte: oneHourAgo },
    },
  });

  if (failedLogins >= 5) {
    logger.warn(`Suspicious activity detected for user ${userId}: ${failedLogins} failed logins`);
    return true;
  }

  // Check for unusual access patterns
  const recentActions = await prisma.auditLog.count({
    where: {
      userId,
      timestamp: { gte: oneHourAgo },
    },
  });

  if (recentActions > 500) {
    logger.warn(`Suspicious activity detected for user ${userId}: ${recentActions} actions in 1 hour`);
    return true;
  }

  return false;
};

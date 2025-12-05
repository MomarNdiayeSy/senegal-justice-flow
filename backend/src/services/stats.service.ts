import { prisma } from '../config/prisma';
import { Role, StatutDossier, StatutAudience } from '@prisma/client';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Global statistics
export const getGlobalStats = async () => {
  const [
    totalDossiers,
    dossiersByStatus,
    totalAudiences,
    audiencesByStatus,
    totalUsers,
    usersByRole,
    recentDossiers,
    recentAudiences,
  ] = await Promise.all([
    prisma.dossier.count(),
    prisma.dossier.groupBy({
      by: ['statut'],
      _count: { id: true },
    }),
    prisma.audience.count(),
    prisma.audience.groupBy({
      by: ['statut'],
      _count: { id: true },
    }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.userRole.groupBy({
      by: ['role'],
      _count: { id: true },
    }),
    prisma.dossier.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.audience.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return {
    dossiers: {
      total: totalDossiers,
      byStatus: dossiersByStatus.reduce((acc, item) => {
        acc[item.statut] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      last30Days: recentDossiers,
    },
    audiences: {
      total: totalAudiences,
      byStatus: audiencesByStatus.reduce((acc, item) => {
        acc[item.statut] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      last30Days: recentAudiences,
    },
    users: {
      total: totalUsers,
      byRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
    },
  };
};

// Monthly evolution
export const getMonthlyEvolution = async (months: number = 12) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const dossiers = await prisma.dossier.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: startDate } },
    _count: { id: true },
  });

  const audiences = await prisma.audience.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: startDate } },
    _count: { id: true },
  });

  // Aggregate by month
  const monthlyData: Record<string, { dossiers: number; audiences: number }> = {};

  dossiers.forEach(d => {
    const monthKey = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[monthKey]) monthlyData[monthKey] = { dossiers: 0, audiences: 0 };
    monthlyData[monthKey].dossiers += d._count.id;
  });

  audiences.forEach(a => {
    const monthKey = `${a.createdAt.getFullYear()}-${String(a.createdAt.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[monthKey]) monthlyData[monthKey] = { dossiers: 0, audiences: 0 };
    monthlyData[monthKey].audiences += a._count.id;
  });

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
};

// Performance stats by judge
export const getJudgePerformance = async (jugeId?: string) => {
  const where = jugeId ? { jugeId } : {};

  const [dossiersTraites, decisionsRendues, averageProcessingTime] = await Promise.all([
    prisma.dossier.count({
      where: { ...where, statut: { in: ['CLOS', 'ARCHIVE'] } },
    }),
    prisma.decision.count({ where }),
    prisma.dossier.findMany({
      where: { ...where, dateCloture: { not: null } },
      select: { dateOuverture: true, dateCloture: true },
    }),
  ]);

  // Calculate average processing time in days
  let avgDays = 0;
  if (averageProcessingTime.length > 0) {
    const totalDays = averageProcessingTime.reduce((sum, d) => {
      if (d.dateCloture) {
        const diff = d.dateCloture.getTime() - d.dateOuverture.getTime();
        return sum + diff / (1000 * 60 * 60 * 24);
      }
      return sum;
    }, 0);
    avgDays = Math.round(totalDays / averageProcessingTime.length);
  }

  return {
    dossiersTraites,
    decisionsRendues,
    delaiMoyenTraitement: avgDays,
  };
};

// Postponement rate analysis
export const getPostponementAnalysis = async (dateRange?: DateRange) => {
  const where: Record<string, unknown> = {};
  if (dateRange) {
    where.dateAudience = {
      gte: dateRange.startDate,
      lte: dateRange.endDate,
    };
  }

  const [totalAudiences, reportees, annulees] = await Promise.all([
    prisma.audience.count({ where }),
    prisma.audience.count({ where: { ...where, statut: 'REPORTEE' } }),
    prisma.audience.count({ where: { ...where, statut: 'ANNULEE' } }),
  ]);

  const postponementRate = totalAudiences > 0 
    ? ((reportees + annulees) / totalAudiences * 100).toFixed(2) 
    : 0;

  // Get postponement reasons
  const reasons = await prisma.audience.groupBy({
    by: ['motifReport'],
    where: { ...where, statut: { in: ['REPORTEE', 'ANNULEE'] }, motifReport: { not: null } },
    _count: { id: true },
  });

  return {
    total: totalAudiences,
    reportees,
    annulees,
    tauxReport: postponementRate,
    motifs: reasons.map(r => ({
      motif: r.motifReport,
      count: r._count.id,
    })),
  };
};

// Dossiers by type analysis
export const getDossiersByType = async () => {
  const byType = await prisma.dossier.groupBy({
    by: ['type'],
    _count: { id: true },
  });

  return byType.map(t => ({
    type: t.type,
    count: t._count.id,
  }));
};

// Today's audiences (for display board)
export const getTodayAudiences = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.audience.findMany({
    where: {
      dateAudience: { gte: today, lt: tomorrow },
      publicationWeb: true,
      statut: { not: 'ANNULEE' },
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
    orderBy: [{ heureDebut: 'asc' }, { salle: 'asc' }],
  });
};

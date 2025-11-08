import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export const chat = async (req: AuthRequest, res: Response) => {
  const { message, context } = req.body;

  if (!message) {
    throw new ApiError(400, 'Message requis');
  }

  // TODO: Implémenter l'intégration avec un service AI
  // Pour l'instant, retourner une réponse mockée
  logger.info(`AI chat request from user: ${req.user?.userId}`);

  res.json({
    success: true,
    data: {
      response: "Je suis un assistant AI pour e-Justice. Cette fonctionnalité sera bientôt disponible.",
      suggestions: [
        "Comment puis-je suivre mon dossier ?",
        "Quelles sont les prochaines audiences ?",
        "Comment déposer un document ?",
      ],
    },
  });
};

export const suggest = async (req: AuthRequest, res: Response) => {
  const { type, context } = req.body;

  // TODO: Implémenter l'intégration avec un service AI
  logger.info(`AI suggest request from user: ${req.user?.userId}, type: ${type}`);

  res.json({
    success: true,
    data: {
      suggestions: [
        "Suggestion 1 basée sur le contexte",
        "Suggestion 2 basée sur le contexte",
        "Suggestion 3 basée sur le contexte",
      ],
    },
  });
};

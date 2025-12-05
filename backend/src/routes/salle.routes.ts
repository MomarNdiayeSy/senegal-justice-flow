import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

import * as salleController from '../controllers/salle.controller';

// Schémas de validation
const createSalleSchema = z.object({
  body: z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    capacite: z.number().min(1).optional(),
    equipements: z.array(z.string()).optional(),
    etage: z.string().optional(),
    batiment: z.string().optional(),
  }),
});

const updateSalleSchema = z.object({
  body: z.object({
    nom: z.string().min(1).optional(),
    capacite: z.number().min(1).optional(),
    equipements: z.array(z.string()).optional(),
    disponible: z.boolean().optional(),
    etage: z.string().optional(),
    batiment: z.string().optional(),
  }),
});

// Routes publiques
router.get('/disponibles', salleController.getSallesDisponibles);

// Routes protégées
router.use(authenticate);

router.get('/', salleController.listSalles);
router.get('/:id', salleController.getSalleById);

// Routes admin/greffier seulement
router.post('/', authorize('ADMIN', 'GREFFIER'), validate(createSalleSchema), salleController.createSalle);
router.put('/:id', authorize('ADMIN', 'GREFFIER'), validate(updateSalleSchema), salleController.updateSalle);
router.delete('/:id', authorize('ADMIN', 'GREFFIER'), salleController.deleteSalle);

// Vérifier disponibilité
router.post('/check-disponibilite', salleController.checkDisponibilite);

export default router;

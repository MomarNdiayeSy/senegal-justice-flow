import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

import * as dossierController from '../controllers/dossier.controller';

router.get('/', dossierController.listDossiers);
router.post('/', dossierController.createDossier);
router.get('/:id', dossierController.getDossierById);
router.put('/:id', dossierController.updateDossier);
router.delete('/:id', dossierController.deleteDossier);

export default router;

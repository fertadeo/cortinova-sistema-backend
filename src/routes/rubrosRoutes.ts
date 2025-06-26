import express from 'express';
import { rubroController } from '../controllers/rubroController';

const router = express.Router();

router.get('/', rubroController.getRubros);
router.get('/:id', rubroController.getRubroById);

export default router; 
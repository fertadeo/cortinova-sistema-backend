import express from 'express';
import { sistemasController } from '../controllers/sistemasController';

const router = express.Router();

router.get('/', sistemasController.getSistemas);
router.get('/:id', sistemasController.getSistemaById);

export default router; 
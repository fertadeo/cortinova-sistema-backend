import express from 'express';
import { medidasController } from '../controllers/medidasController';

const router = express.Router();

// Rutas para gestión de medidas
router.get('/', medidasController.getAllMedidas);
router.get('/:id', medidasController.getMedidaById);
router.get('/cliente/:clienteId', medidasController.getMedidasByCliente);
router.post('/', medidasController.createMedida);
router.put('/:id', medidasController.updateMedida);
router.delete('/:id', medidasController.deleteMedida);

export default router; 
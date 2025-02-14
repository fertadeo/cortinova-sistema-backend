// routes/presupuestoRoutes.ts
import express from 'express';
import { presupuestoController } from '../controllers/presupuestoController';

const router = express.Router();

router.get('/', presupuestoController.getAllPresupuestos);
router.get('/presupuestos-por-mes', presupuestoController.getPresupuestosPorMes);
router.get('/cliente/:clienteId', presupuestoController.getPresupuestosByCliente);
router.post('/', presupuestoController.createPresupuesto);
router.post('/:id/convertir-a-pedido', presupuestoController.convertirAPresupuesto);

export default router;
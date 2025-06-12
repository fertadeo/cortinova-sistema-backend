import { Router } from 'express';
import { cambiarEstadoPedido, getPedidos, actualizarEstadoYFechaEntrega } from '../controllers/pedidoController';

const router = Router();

router.patch('/:id/estado', cambiarEstadoPedido);
router.get('/', getPedidos);
router.put('/:presupuestoId/estado-entrega', actualizarEstadoYFechaEntrega);

export default router; 
import { Router } from 'express';
import { cambiarEstadoPedido, getPedidos } from '../controllers/pedidoController';

const router = Router();

router.patch('/:id/estado', cambiarEstadoPedido);
router.get('/', getPedidos);

export default router; 
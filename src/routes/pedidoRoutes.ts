import { Router } from 'express';
import { cambiarEstadoPedido, getPedidos, actualizarEstadoYFechaEntrega, getPedidosConfirmadosPorMes } from '../controllers/pedidoController';

const router = Router();

// RUTAS ESPECÍFICAS - DEBEN IR ANTES DE LAS RUTAS CON PARÁMETROS
router.get('/pedidos-confirmados-por-mes', getPedidosConfirmadosPorMes);

// RUTAS CON PARÁMETROS DINÁMICOS - DEBEN IR DESPUÉS
router.patch('/:id/estado', cambiarEstadoPedido);
router.get('/', getPedidos);
router.put('/:presupuestoId/estado-entrega', actualizarEstadoYFechaEntrega);

export default router; 
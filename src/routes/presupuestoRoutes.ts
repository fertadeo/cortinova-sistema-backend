// routes/presupuestoRoutes.ts
import express from 'express';
import { presupuestoController } from '../controllers/presupuestoController';
import { medidasController } from '../controllers/medidasController';

const router = express.Router();

router.get('/', presupuestoController.getAllPresupuestos);
router.get('/presupuestos-por-mes', presupuestoController.getPresupuestosPorMes);
router.get('/cliente/:clienteId', presupuestoController.getPresupuestosByCliente);
router.get('/:id', presupuestoController.getPresupuestoById);
router.post('/', presupuestoController.createPresupuesto);
router.put('/:id/descuento', presupuestoController.updatePresupuestoConDescuento);
router.post('/:id/convertir-a-pedido', presupuestoController.convertirAPresupuesto);
router.get('/medidas-cliente/:clienteId', medidasController.getMedidasAgrupadasByCliente);
router.post('/crear-con-medidas', presupuestoController.crearPresupuestoConMedidas);

// Nuevas rutas para obtener productos filtrados para presupuestos
router.get('/productos-filtrados', presupuestoController.obtenerProductosParaPresupuesto);
router.get('/productos-sin-categorias', presupuestoController.obtenerProductosExcluyendoCategorias);

export default router;
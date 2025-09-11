// routes/presupuestoRoutes.ts
import express from 'express';
import { presupuestoController } from '../controllers/presupuestoController';
import { medidasController } from '../controllers/medidasController';

const router = express.Router();

router.get('/', presupuestoController.getAllPresupuestos);
router.get('/presupuestos-por-mes', presupuestoController.getPresupuestosPorMes);
router.get('/cliente/:clienteId', presupuestoController.getPresupuestosByCliente);

// NUEVAS RUTAS ESPECÍFICAS - DEBEN IR ANTES DE LAS RUTAS CON PARÁMETROS
router.get('/productos-filtrados', presupuestoController.obtenerProductosParaPresupuesto);
router.get('/productos-sin-categorias', presupuestoController.obtenerProductosExcluyendoCategorias);
router.get('/medidas-cliente/:clienteId', medidasController.getMedidasAgrupadasByCliente);

// RUTAS CON PARÁMETROS DINÁMICOS - DEBEN IR DESPUÉS
router.get('/:id', presupuestoController.getPresupuestoById);
router.post('/', presupuestoController.createPresupuesto);
router.put('/:id/descuento', presupuestoController.updatePresupuestoConDescuento);
router.post('/:id/convertir-a-pedido', presupuestoController.convertirAPresupuesto);
router.post('/crear-con-medidas', presupuestoController.crearPresupuestoConMedidas);
router.delete('/:id', presupuestoController.deletePresupuesto);

export default router;
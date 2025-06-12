import { Router } from 'express';
import { clienteController } from '../controllers/clienteController';
const router = Router();

router.get('/', clienteController.getClientes);
router.get('/clientes-por-mes', clienteController.getClientesPorMes);
router.post('/', clienteController.createCliente);
router.put('/:id', clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);
// router.get('/getNextClienteId', clienteController.getNextClienteId);
router.get('/:id', clienteController.getClienteById);
export default router;
 
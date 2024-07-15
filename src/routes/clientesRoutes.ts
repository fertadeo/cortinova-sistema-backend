import { Router } from 'express';
import { getClientes, createCliente, updateCliente } from '../controllers/clienteController';

const router = Router();

router.get('/', getClientes);
router.post('/', createCliente);
router.post('/:id', updateCliente)

export default router;

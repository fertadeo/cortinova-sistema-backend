import { Router } from 'express';
import { getClientes, createCliente } from '../controllers/clienteController';

const router = Router();

router.get('/', getClientes);
router.post('/', createCliente);

// Agregar otras rutas como PUT, DELETE, etc.

export default router;

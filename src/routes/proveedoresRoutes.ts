import { Router } from 'express';
import { obtenerProveedores } from '../controllers/proveedoresController';

const router = Router();

// Ruta para obtener todos los proveedores
router.get('/', obtenerProveedores);

export default router;

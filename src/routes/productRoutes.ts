import { Router } from 'express';
import { importarProductos } from '../controllers/productController'; // Asegúrate de que el controlador esté bien importado

const router = Router();

// Ruta para importar productos desde un archivo CSV o JSON
router.post('/importar-productos', importarProductos);

export default router;
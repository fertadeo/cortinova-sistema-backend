import { Router } from 'express';
import { importarProductos, obtenerProductos } from '../controllers/productController'; // Asegúrate de que el controlador esté bien importado

const router = Router();

// Ruta para importar productos desde un archivo CSV o JSON
router.post('/importar-productos', importarProductos);


// Obtener valores de la bd luego de cargarlos con excel 
router.get('/importar-productos', obtenerProductos)
export default router; 
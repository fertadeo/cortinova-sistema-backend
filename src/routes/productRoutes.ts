import { Router } from 'express';
import { actualizarProducto, importarProductos, obtenerProductoPorId, obtenerTodosLosProductos } from '../controllers/productController'; // Asegúrate de que el controlador esté bien importado

const router = Router();

// Ruta para importar productos desde un archivo CSV o JSON
router.post('/importar-productos', importarProductos);
router.get('/:id', obtenerProductoPorId);
router.get('/', obtenerTodosLosProductos);
// Obtener valores de la bd luego de cargarlos con excel 
router.get('/', obtenerProductoPorId)
router.put('/:id', actualizarProducto); // Nueva ruta para actualizar productos
export default router; 
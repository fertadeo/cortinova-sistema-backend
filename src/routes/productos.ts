import { Router } from 'express';
import { Producto } from '../entities/Producto';  // Importa la entidad Producto
import { AppDataSource } from '../config/database'; // Configura el datasource de TypeORM

const router = Router();
 
// Ruta para recibir el JSON de los productos
router.post('/importar-productos', async (req, res) => {
    const productos = req.body; // Los datos vienen como JSON

    if (!Array.isArray(productos)) {
        return res.status(400).json({ message: 'Formato de datos incorrecto' });
    }

    try {
        // Validar e insertar los productos en la base de datos
        for (const producto of productos) {
            const nuevoProducto = new Producto();
            nuevoProducto.sku = producto.ID;
            nuevoProducto.nombre = producto.Producto;
            nuevoProducto.disponibilidad = producto.Disponible;
            nuevoProducto.descripcion = producto.Descripción;
            nuevoProducto.precio = parseFloat(producto['Precio Divisa']);
            nuevoProducto.divisa = producto.Divisa;
            nuevoProducto.descuento = parseFloat(producto.Descuento.replace('%', ''));

            // Guardar el producto en la base de datos usando TypeORM
            await AppDataSource.getRepository(Producto).save(nuevoProducto);
        }

        res.status(200).json({ message: 'Productos importados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al importar productos' });
    }
});

export default router;

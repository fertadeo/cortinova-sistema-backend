import { Request, Response } from 'express';
import { Producto } from '../entities/Producto';
import { AppDataSource } from '../config/database'; // Configura tu datasource de TypeORM

// Controlador para importar productos
export const importarProductos = async (req: Request, res: Response) => {
    const productos = req.body;
    console.log('Datos recibidos:', productos);

    if (!Array.isArray(productos)) {
        return res.status(400).json({ message: 'Formato de datos incorrecto. Se esperaba un array de productos.' });
    }

    try {
        for (const producto of productos) {
            const nuevoProducto = new Producto();
            nuevoProducto.id = producto.id;
            nuevoProducto.nombreProducto = producto.Producto;
            nuevoProducto.cantidad_stock = producto.Cantidad_stock;
            nuevoProducto.descripcion = producto.Descripción;
            nuevoProducto.precioCosto = producto.PrecioCosto;
            nuevoProducto.precio = parseFloat(producto['Precio Divisa']);
            nuevoProducto.divisa = producto.Divisa;
            nuevoProducto.descuento = parseFloat(producto.Descuento.replace('%', ''));

            console.log('Guardando producto:', nuevoProducto);

            await AppDataSource.getRepository(Producto).save(nuevoProducto);
        }

        return res.status(200).json({ message: 'Productos importados correctamente' });
    } catch (error) {
        console.error('Error al importar productos:', error);
        return res.status(500).json({ message: 'Error al importar productos en la base de datos' });
    }
};


// controllers/productController.ts

const productoRepository = AppDataSource.getRepository(Producto);

export const obtenerProductos = async (req: Request, res: Response) => {
  try {
    const productos = await productoRepository.find(); // Obtiene todos los productos
    res.json(productos); // Devuelve los productos en formato JSON
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los productos' });
    console.error(error);
  }
};

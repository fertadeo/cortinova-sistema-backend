import { Request, Response } from 'express';
import { Producto } from '../entities/Producto';
import { AppDataSource } from '../config/database'; // Configura tu datasource de TypeORM

// Controlador para importar productos (sin modificaciones)
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

// Obtén el repositorio del producto
const productoRepository = AppDataSource.getRepository(Producto);

// Función para obtener todos los productos
export const obtenerTodosLosProductos = async (req: Request, res: Response) => {
  try {
    const productos = await productoRepository.find({ relations: ['proveedor'] }); // Asegúrate de incluir relaciones necesarias
    res.json(productos); // Devolver todos los productos en formato JSON
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    res.status(500).json({ message: 'Error al obtener todos los productos' });
  }
};

// Función para obtener un producto por ID
export const obtenerProductoPorId = async (req: Request, res: Response) => {
  const { id } = req.params; // Obtener el ID desde los parámetros de la URL

  // Verificación para asegurar que el id es un número válido
  const productId = Number(id);
  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({ message: 'ID de producto inválido' });
  }

  try {
    // Buscar el producto por ID y cargar la relación con el proveedor
    const producto = await productoRepository.findOne({
      where: { id: productId },
      relations: ['proveedor'],
    });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Preparar el resultado con los datos del proveedor
    const resultado = {
      id: producto.id,
      nombreProducto: producto.nombreProducto,
      descripcion: producto.descripcion,
      precio: producto.precio,
      nombreProveedores: producto.proveedor ? producto.proveedor.nombreProveedores : null,
    };

    res.json(resultado); // Devolver el resultado en formato JSON
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }

  console.log('ID recibido:', id);
};

// Función para actualizar un producto existente
export const actualizarProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombreProducto, cantidad_stock, descripcion, precioCosto, precio, divisa, descuento, rubro_id, sistema_id, disponible, proveedor_id } = req.body;

  // Verificación para asegurar que el id es un número válido
  const productId = Number(id);
  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({ message: 'ID de producto inválido' });
  }

  try {
    // Buscar el producto por ID
    const producto = await productoRepository.findOne({ where: { id: productId } });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Actualizar los campos del producto
    producto.nombreProducto = nombreProducto ?? producto.nombreProducto;
    producto.cantidad_stock = cantidad_stock ?? producto.cantidad_stock;
    producto.descripcion = descripcion ?? producto.descripcion;
    producto.precioCosto = precioCosto ?? producto.precioCosto;
    producto.precio = precio ?? producto.precio;
    producto.divisa = divisa ?? producto.divisa;
    producto.descuento = descuento ?? producto.descuento;
    producto.rubro_id = rubro_id ?? producto.rubro_id;
    producto.sistema_id = sistema_id ?? producto.sistema_id;
    producto.disponible = disponible ?? producto.disponible;
    producto.proveedor = proveedor_id ?? producto.proveedor;

    // Guardar los cambios
    await productoRepository.save(producto);

    return res.status(200).json({ message: 'Producto actualizado correctamente', producto });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
};

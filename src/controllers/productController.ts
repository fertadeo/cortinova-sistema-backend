import { Request, Response } from 'express';
import { Producto } from '../entities/Producto';
import { AppDataSource } from '../config/database'; // Configura tu datasource de TypeORM
import * as XLSX from 'xlsx';
import multer, { StorageEngine } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { Request as MulterRequest } from 'express';

// Función de validación de precio mejorada
const validarPrecio = (precio: any, contexto: string = ''): string => {
  if (precio === null || precio === undefined) {
    return "0";
  }
  
  if (typeof precio === 'string') {
    const precioLimpio = precio.trim();
    if (precioLimpio === '') {
      return "0";
    }
    
    let precioProcesado = precioLimpio
      .replace(/[^\d.,]/g, '')
      .replace(',', '.');
    
    if (precioProcesado === '') {
      return "0";
    }
    
    const numero = Number(precioProcesado);
    if (isNaN(numero)) {
      return "0";
    }
    
    if (numero < 0) {
      return "0";
    }
    
    if (numero === Infinity) {
      return "0";
    }
    
    return String(numero);
  }
  
  if (typeof precio === 'number') {
    if (isNaN(precio)) {
      return "0";
    }
    
    if (precio < 0) {
      return "0";
    }
    
    if (precio === Infinity) {
      return "0";
    }
    
    return String(precio);
  }
  
  return "0";
};

// Extiende el tipo Request para incluir el campo 'file' de Multer
interface MulterFileRequest extends Request {
  file?: Express.Multer.File;
}

// Controlador para importar productos (sin modificaciones)
export const importarProductos = async (req: Request, res: Response) => {
  const productos = req.body;

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
      nuevoProducto.precio = producto.Precio;
      nuevoProducto.divisa = producto.Divisa;
      nuevoProducto.descuento = parseFloat(producto.Descuento.replace('%', ''));
      nuevoProducto.proveedor_id = producto.proveedor_id;
      nuevoProducto.rubro_id = producto.rubro_id;
      nuevoProducto.sistema_id = producto.sistema_id;

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
    const productos = await productoRepository.find({ relations: ['proveedor'] });
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    res.status(500).json({ message: 'Error al obtener todos los productos' });
  }
};

// Función para obtener un producto por ID
export const obtenerProductoPorId = async (req: Request, res: Response) => {
  const { id } = req.params;
  const productId = Number(id);
  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({ message: 'ID de producto inválido' });
  }

  try {
    const producto = await productoRepository.findOne({
      where: { id: productId },
      relations: ['proveedor'],
    });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const resultado = {
      id: producto.id,
      nombreProducto: producto.nombreProducto,
      descripcion: producto.descripcion,
      precio: producto.precio,
      nombreProveedores: producto.proveedor ? producto.proveedor.nombreProveedores : null,
    };

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
};

export const obtenerProductosPorProveedor = async (req: Request, res: Response) => {
  const { proveedor_id } = req.params;

  const proveedorId = Number(proveedor_id);
  if (isNaN(proveedorId) || proveedorId <= 0) {
    return res.status(400).json({ message: 'ID de proveedor inválido' });
  }

  try {
    // Buscar productos por proveedor
    const productos = await productoRepository.find({
      where: { proveedor: { id: proveedorId } },
      relations: ['proveedor'],
    });

    if (productos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos para el proveedor especificado' });
    }

    return res.status(200).json({ productos });
  } catch (error) {
    console.error('Error al obtener productos por proveedor:', error);
    return res.status(500).json({ message: 'Error al obtener productos por proveedor' });
  }
};

// Nueva función para obtener el último ID de los productos
export const obtenerUltimoIdProducto = async (req: Request, res: Response) => {
  try {
    // Obtener el producto con el ID más alto
    const ultimoProducto = await productoRepository
      .createQueryBuilder('producto')
      .orderBy('producto.id', 'DESC')
      .getOne();

    if (!ultimoProducto) {
      return res.status(404).json({ message: 'No se encontraron productos' });
    }

    // Retornar el ID más alto
    return res.json({ ultimoId: ultimoProducto.id });
  
  } catch (error) {
    console.error('Error al obtener el último ID de producto:', error);
    return res.status(500).json({ message: 'Error al obtener el último ID de producto' });
  }
};

// Función para actualizar un producto existente
export const actualizarProducto = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombreProducto, cantidad_stock, descripcion, precioCosto, precio, divisa, descuento, rubro_id, sistema_id, disponible, proveedor_id } = req.body;

  const productId = Number(id);
  if (isNaN(productId) || productId <= 0) {
    return res.status(400).json({ message: 'ID de producto inválido' });
  }

  try {
    const producto = await productoRepository.findOne({ where: { id: productId } });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const precioValidado = validarPrecio(precio, `Actualizar Producto ID ${id}`);

    producto.nombreProducto = nombreProducto ?? producto.nombreProducto;
    producto.cantidad_stock = cantidad_stock ?? producto.cantidad_stock;
    producto.descripcion = descripcion ?? producto.descripcion;
    producto.precioCosto = precioCosto ?? producto.precioCosto;
    producto.precio = precioValidado;
    producto.divisa = divisa ?? producto.divisa;
    producto.descuento = descuento ?? producto.descuento;
    producto.rubro_id = rubro_id ?? producto.rubro_id;
    producto.sistema_id = sistema_id ?? producto.sistema_id;
    producto.disponible = disponible ?? producto.disponible;
    producto.proveedor_id = proveedor_id ?? producto.proveedor_id;

    await productoRepository.save(producto);

    return res.status(200).json({ message: 'Producto actualizado correctamente', producto });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
};

export const actualizarPreciosPorProveedor = async (req: Request, res: Response) => {
  const productosActualizados = req.body;

  if (!Array.isArray(productosActualizados)) {
    return res.status(400).json({ message: 'Se esperaba un array de productos para actualizar' });
  }

  try {
    for (const productoActualizado of productosActualizados) {
      const { id, Precio } = productoActualizado;

      // Validar que el producto tenga un ID y un precio válido
      if (!id || typeof Precio !== 'string') {
        continue;
      }

      // Buscar el producto por ID
      const producto = await productoRepository.findOne({ where: { id } });

      if (!producto) {
        continue;
      }

      // Validar y actualizar el precio del producto
      const precioValidado = validarPrecio(Precio, `Actualizar Precios por Proveedor - ID ${id}`);
      producto.precio = precioValidado;

      // Guardar los cambios en la base de datos
      await productoRepository.save(producto);
    }

    return res.status(200).json({ message: 'Precios actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar precios:', error);
    return res.status(500).json({ message: 'Error al actualizar precios' });
  }
};

// Controlador para crear un nuevo producto
export const crearProducto = async (req: Request, res: Response) => {
  const {
    id,
    nombreProducto,
    cantidad_stock,
    descripcion,
    precioCosto,
    precio,
    divisa,
    descuento,
    rubro_id,
    sistema_id,
    disponible,
    proveedor_id,
  } = req.body;

  try {
    // Crear una instancia de producto
    const nuevoProducto = new Producto();
    nuevoProducto.id = id;
    nuevoProducto.nombreProducto = nombreProducto;
    nuevoProducto.cantidad_stock = cantidad_stock;
    nuevoProducto.descripcion = descripcion;
    nuevoProducto.precioCosto = precioCosto;
    nuevoProducto.precio = validarPrecio(precio, 'Crear Producto');
    nuevoProducto.divisa = divisa;
    nuevoProducto.descuento = descuento;
    nuevoProducto.rubro_id = rubro_id;
    nuevoProducto.sistema_id = sistema_id;
    nuevoProducto.disponible = disponible;
    nuevoProducto.proveedor_id = proveedor_id;

    // Guardar el nuevo producto en la base de datos
    await AppDataSource.getRepository(Producto).save(nuevoProducto);

    return res.status(201).json({ message: 'Producto creado exitosamente', producto: nuevoProducto });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    return res.status(500).json({ message: 'Error al crear el producto' });
  }
};

export const obtenerTelas = async (req: Request, res: Response) => {
  try {
    const productos = await productoRepository.find({
      where: { rubro_id: "4" },
      relations: ['proveedor']
    });

    if (productos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron telas disponibles' });
    }

    return res.status(200).json({ productos });
  } catch (error) {
    console.error('Error al obtener telas:', error);
    return res.status(500).json({ message: 'Error al obtener telas' });
  }
};

export const obtenerRielesYBarrales = async (req: Request, res: Response) => {
  try {
    const productos = await productoRepository.find({
      where: [
        { rubro_id: "5" }, // Rieles
        { rubro_id: "6" }, // Barrales
        { rubro_id: "8" }  // FLEXCOLOR
      ],
      relations: ['proveedor']
    });

    if (productos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos disponibles' });
    }

    return res.status(200).json({ productos });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Configuración de multer para subida de archivos Excel
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'productos-masivos-' + uniqueSuffix + path.extname(file.originalname));
  }
});
export const uploadMasivo = multer({ storage });

// Controlador para importación masiva desde JSON
export const importacionMasivaProductos = async (req: Request, res: Response) => {
  const productosExcel = req.body.productos;

  if (!Array.isArray(productosExcel)) {
    return res.status(400).json({ message: 'El body debe tener un array "productos".' });
  }

  try {
    const productoRepository = AppDataSource.getRepository(Producto);
    let creados = 0;
    let actualizados = 0;
    let errores: string[] = [];
    let errores_detallados: any[] = [];

    for (const [i, row] of productosExcel.entries()) {
      try {
        // Normalización de campos
        const id = row['ID'] ?? row['id'];
        const nombreProducto = row['nombreProducto'] || row['NombreProducto'] || row['Producto'] || '';
        const descripcion = row['descripcion'] || row['Descripcion'] || row['Descripción'] || '';
        const cantidad_stock = String(row['cantidad_stock'] ?? row['Cantidad_stock'] ?? '0');
        const precioCostoOriginal = row['precioCosto'] ?? row['PrecioCosto'] ?? row['Precio de Costo'] ?? 0;
        const precioPublicoOriginal = row['precio'] ?? row['Precio'] ?? row['Precio al Publico'] ?? row['Precio al Público'] ?? 0;
        const divisa = row['divisa'] || row['Divisa'] || 'ARS';
        const descuento = row['descuento'] && !isNaN(Number(row['descuento'])) ? Number(row['descuento']) : 0;
        const disponible = row['disponible'] === 'SI' || row['disponible'] === 'si' || row['disponible'] === '1' || row['disponible'] === true;

        let proveedor_id = 1;
        const proveedorIdRaw = row['proveedor_id'] || row['Proveedor_id'];
        if (proveedorIdRaw && proveedorIdRaw !== '' && !isNaN(Number(proveedorIdRaw))) {
          proveedor_id = Number(proveedorIdRaw);
        }

        let rubro_id = '';
        const rubroIdRaw = row['rubro_id'] || row['Rubro_id'];
        if (rubroIdRaw && rubroIdRaw !== '' && !isNaN(Number(rubroIdRaw))) {
          rubro_id = String(rubroIdRaw);
        }

        let sistema_id = '';
        const sistemaIdRaw = row['sistema_id'] || row['Sistema_id'];
        if (sistemaIdRaw && sistemaIdRaw !== '' && !isNaN(Number(sistemaIdRaw))) {
          sistema_id = String(sistemaIdRaw);
        }

        // Validación y conversión de precios
        const precioCosto = validarPrecio(precioCostoOriginal, `Fila ${i + 2} - Precio de Costo`);
        const precio = validarPrecio(precioPublicoOriginal, `Fila ${i + 2} - Precio al Público`);

        // Validación detallada
        let erroresFila: any[] = [];
        if (!nombreProducto) {
          erroresFila.push({
            campo: "nombreProducto",
            valor_recibido: nombreProducto,
            valor_esperado: "string (no vacío)",
            sugerencia: "Completa el nombre del producto. No puede estar vacío."
          });
        }
        if (!precio || precio === "0") {
          erroresFila.push({
            campo: "precio",
            valor_recibido: precio,
            valor_esperado: "número mayor a 0",
            sugerencia: "El precio debe ser un número mayor a 0. Corrige el valor en el archivo de importación."
          });
        }

        if (erroresFila.length > 0) {
          errores.push(`Fila ${i + 2}: Producto sin nombre o precio inválido, no se importa.`);
          errores_detallados.push({
            fila: i + 2,
            errores: erroresFila,
            datos_completos: row
          });
          continue;
        }

        // Buscar si el producto ya existe por ID
        let producto = id ? await productoRepository.findOne({ where: { id } }) : null;

        if (producto) {
          // Actualizar producto existente
          producto.nombreProducto = nombreProducto || producto.nombreProducto;
          producto.descripcion = descripcion || producto.descripcion;
          producto.precioCosto = precioCosto;
          producto.precio = precio;
          producto.disponible = disponible;
          producto.descuento = descuento;
          producto.proveedor_id = proveedor_id;
          producto.rubro_id = rubro_id;
          producto.sistema_id = sistema_id;
          producto.cantidad_stock = cantidad_stock;
          producto.divisa = divisa;
          await productoRepository.save(producto);
          actualizados++;
        } else {
          // Crear nuevo producto
          const nuevoProducto = productoRepository.create({
            nombreProducto: nombreProducto || 'Sin nombre',
            descripcion: descripcion || '',
            precioCosto,
            precio,
            disponible,
            descuento,
            proveedor_id,
            rubro_id,
            sistema_id,
            cantidad_stock,
            divisa
          });
          await productoRepository.save(nuevoProducto);
          creados++;
        }
      } catch (err: any) {
        errores.push(`Fila ${i + 2}: ${err.message}`);
      }
    }

    res.json({
      message: 'Importación masiva completada',
      productos_creados: creados,
      productos_actualizados: actualizados,
      errores,
      errores_detallados
    });
  } catch (error: any) {
    console.error('Error general en la importación masiva:', error);
    res.status(500).json({ message: 'Error en la importación masiva', error: error.message });
  }
};

// Función para corregir productos con precio 0
export const corregirPreciosCero = async (req: Request, res: Response) => {
  try {
    const productoRepository = AppDataSource.getRepository(Producto);
    
    // Buscar productos con precio 0
    const productosConPrecioCero = await productoRepository.find({
      where: [
        { precio: "0" },
        { precio: "0.0" },
        { precio: "0.00" }
      ]
    });
    
    let corregidos = 0;
    let errores = 0;
    
    for (const producto of productosConPrecioCero) {
      try {
        // Intentar usar el precio de costo si es válido
        if (producto.precioCosto && producto.precioCosto !== "0" && producto.precioCosto !== "") {
          const precioCostoValidado = validarPrecio(producto.precioCosto, `Corrección ID ${producto.id} - Precio Costo`);
          if (precioCostoValidado !== "0") {
            producto.precio = precioCostoValidado;
          } else {
            // Si no hay precio de costo válido, usar un precio por defecto según el rubro
            const precioPorDefecto = obtenerPrecioPorDefecto(producto.rubro_id);
            producto.precio = String(precioPorDefecto);
          }
        } else {
          // Usar precio por defecto según el rubro
          const precioPorDefecto = obtenerPrecioPorDefecto(producto.rubro_id);
          producto.precio = String(precioPorDefecto);
        }
        
        await productoRepository.save(producto);
        corregidos++;
        
      } catch (err) {
        errores++;
      }
    }
    
    res.json({
      message: 'Corrección de precios completada',
      productos_encontrados: productosConPrecioCero.length,
      productos_corregidos: corregidos,
      errores: errores
    });
    
  } catch (error) {
    console.error('Error en la corrección de precios:', error);
    res.status(500).json({ message: 'Error en la corrección de precios', error: (error as Error).message });
  }
};

// Función auxiliar para obtener precio por defecto según rubro
const obtenerPrecioPorDefecto = (rubroId: string): number => {
  const preciosPorDefecto: { [key: string]: number } = {
    '1': 25000, // CONFECCIONES
    '2': 10000, // COLOCACIONES
    '3': 30000, // ARREGLOS
    '4': 20000, // TELAS
    '5': 50000, // RIELES
    '6': 20000, // BARRALES
    '7': 50000, // ALFOMBRAS
    '8': 40000  // FLEXCOLOR
  };
  
  return preciosPorDefecto[rubroId] || 25000; // Precio por defecto general
};